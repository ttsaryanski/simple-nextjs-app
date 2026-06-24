import { RingLoader } from "react-spinners";

export default function Loading() {
    // Stack uses React Suspense, which will render this page while user data is being fetched.
    // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <RingLoader color="#4F46E5" size={150} className="mx-auto my-20" />
        </div>
    );
}
