import FunTechLoader from "@/components/UI/FunTechLoader";

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
            <FunTechLoader />
        </div>
    );
}
