const LoadingSkeleton = ({ type = 'card', count = 3 }) => {
    const CardSkeleton = () => (
        <div className="glass-card rounded-2xl p-5 animate-pulse">
            <div className="flex justify-between mb-3">
                <div className="h-5 bg-white/5 rounded w-2/3"></div>
                <div className="h-5 bg-white/5 rounded w-16"></div>
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                <div className="h-4 bg-white/5 rounded w-3/5"></div>
            </div>
            <div className="h-2 bg-white/5 rounded-full mb-4"></div>
            <div className="flex gap-2">
                <div className="h-10 bg-white/5 rounded-xl flex-1"></div>
                <div className="h-10 bg-[#16A34A]/5 rounded-xl flex-1"></div>
            </div>
        </div>
    );

    const LineSkeleton = () => (
        <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/5 rounded w-full"></div>
            <div className="h-4 bg-white/5 rounded w-4/5"></div>
            <div className="h-4 bg-white/5 rounded w-3/5"></div>
        </div>
    );

    if (type === 'card') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
        );
    }

    return <LineSkeleton />;
};

export default LoadingSkeleton;
