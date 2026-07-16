import pdfplumber
import re
import pandas as pd
from pathlib import Path
from datetime import datetime


def normalize_bg_text(text: str) -> str:
    """Repair common mojibake where cp1251 Cyrillic was decoded as cp1252."""
    try:
        fixed = text.encode("cp1252").decode("cp1251")
        return fixed
    except Exception:
        return text


def extract_kwh_from_text(text: str):
    day_kwh = 0
    night_kwh = 0

    for line in text.splitlines():
        l = line.strip().lower()
        if not l:
            continue

        # Typical invoice line: "Дневна 5580 5854 274 0.21326 58.43"
        m = re.search(r"^(дневна|нощна)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+[.,]\d+)\s+(\d+[.,]\d+)", l)
        if not m:
            continue

        value = int(m.group(4))
        if m.group(1) == "дневна":
            day_kwh += value
        else:
            night_kwh += value

    return day_kwh, night_kwh


def save_df(df: pd.DataFrame, excel_path: str):
    try:
        df.to_excel(excel_path, index=False)
        return excel_path
    except ModuleNotFoundError as e:
        if "openpyxl" not in str(e).lower():
            raise
        csv_path = str(Path(excel_path).with_suffix(".csv"))
        df.to_csv(csv_path, index=False, encoding="utf-8-sig")
        return csv_path


def derive_period_fields(date_str: str):
    if not date_str:
        return None, None, None

    try:
        invoice_date = datetime.strptime(date_str, "%d.%m.%Y")
    except ValueError:
        return None, None, None

    if invoice_date.month == 1:
        prev_month = 12
        prev_year = invoice_date.year - 1
    else:
        prev_month = invoice_date.month - 1
        prev_year = invoice_date.year

    period = f"{prev_year:04d}-{prev_month:02d}-01 00:00:00"
    return period, prev_month, prev_year

def extract_energo_pro_data(pdf_path: str):
    data = {
        'file': Path(pdf_path).name,
        'invoice_number': None,
        'date': None,
        'day_kwh': 0,
        'night_kwh': 0,
        'total_with_vat': None,
        'status': 'success'
    }
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            full_text = ""
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text() or ""
                full_text += text + "\n"
                
                tables = page.extract_tables()
                for table in tables:
                    if not table:
                        continue
                    for row in table:
                        if not row:
                            continue
                        # Събираме целия ред в един текст
                        row_text = " ".join(str(cell or "").strip() for cell in row)
                        
                        # Сумиране на Дневна (всички срещания)
                        day_matches = re.findall(r'Дневна.*?(\d{1,5})\b', row_text)
                        for m in day_matches:
                            try:
                                data['day_kwh'] += int(m)
                            except:
                                pass
                        
                        # Сумиране на Нощна (всички срещания)
                        night_matches = re.findall(r'Нощна.*?(\d{1,5})\b', row_text)
                        for m in night_matches:
                            try:
                                data['night_kwh'] += int(m)
                            except:
                                pass

            # Някои PDF-и са с повредена кирилица; нормализираме текста и
            # извличаме kWh директно от редовете, ако таблиците не са надеждни.
            normalized_text = normalize_bg_text(full_text)
            if data['day_kwh'] == 0 and data['night_kwh'] == 0:
                day_from_text, night_from_text = extract_kwh_from_text(normalized_text)
                data['day_kwh'] = day_from_text
                data['night_kwh'] = night_from_text
            
            # Метаданни
            num_match = re.search(r'№\s*(\d+)', normalized_text)
            if num_match:
                data['invoice_number'] = num_match.group(1)
            
            date_match = re.search(r'от дата[:\s]*(\d{2}\.\d{2}\.\d{4})', normalized_text)
            if date_match:
                data['date'] = date_match.group(1)
            
            # Сума за плащане
            total_match = re.search(r'Сума за плащане[:\s]*([\d\s,.]+)', normalized_text)
            if total_match:
                val = total_match.group(1).replace(' ', '').replace(',', '.')
                data['total_with_vat'] = float(val)
            else:
                # Резервно търсене
                alt = re.search(r'(\d{2,4}[.,]\d{2})\s*лв', normalized_text, flags=re.IGNORECASE)
                if alt:
                    data['total_with_vat'] = float(alt.group(1).replace(',', '.'))
        
        # Проверка за валидност
        if data['day_kwh'] == 0 and data['night_kwh'] == 0:
            data['status'] = 'no_energy_data'
            
    except Exception as e:
        data['status'] = f'error: {str(e)[:100]}'
    
    return data


def process_all_pdfs(folder_path: str = ".", output_excel: str = "energo_pro_summary.xlsx"):
    folder = Path(folder_path)
    results = []
    skipped = []
    
    pdf_files = list(folder.glob("*.pdf"))
    print(f"Намерени {len(pdf_files)} PDF файла.\n")
    
    for pdf_file in pdf_files:
        print(f"Обработвам: {pdf_file.name}")
        result = extract_energo_pro_data(str(pdf_file))
        
        if result['status'] == 'success':
            period, month, year = derive_period_fields(result.get('date'))
            result['period'] = period
            result['month'] = month
            result['year'] = year
            results.append(result)
            print(f"  ✓ Успешно | Дневна: {result['day_kwh']} кВтч | Нощна: {result['night_kwh']} кВтч | Сума: {result['total_with_vat']} евро")
        else:
            skipped.append({'file': pdf_file.name, 'reason': result['status']})
            print(f"  ✗ Скипнат | Причина: {result['status']}")
    
    # Запис
    if results:
        df = pd.DataFrame(results)
        df['total_kwh'] = df['day_kwh'] + df['night_kwh']
        columns = ['file', 'invoice_number', 'total_with_vat', 'period', 'month', 'year', 'day_kwh', 'night_kwh', 'total_kwh']
        df = df[columns]
        saved_to = save_df(df, output_excel)
        print(f"\n✅ Готово! Обработени {len(results)} фактури → {saved_to}")
    
    if skipped:
        print(f"\n⚠️ Скипнати файлове: {len(skipped)}")
        for s in skipped:
            print(f"   • {s['file']} → {s['reason']}")
        skipped_saved_to = save_df(pd.DataFrame(skipped), "skipped_files.xlsx")
        print(f"   Файл със скипнати: {skipped_saved_to}")
    
    return results


# Стартиране
if __name__ == "__main__":
    process_all_pdfs()