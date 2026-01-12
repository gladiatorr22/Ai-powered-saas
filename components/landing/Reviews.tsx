import React from "react";

function Reviews() {
    const reviews = [
        {
            name: "Alex Chen",
            role: "Digital Artist",
            quote: "Lumina transformed my workflow. The AI compression is undistinguishable from the original.",
        },
        {
            name: "Sarah Jones",
            role: "Content Creator",
            quote: "The one-click social resizing is a game changer. I save hours every week.",
        },
        {
            name: "Marcus Lei",
            role: "Agency Owner",
            quote: "Finally, a video tool that looks as good as the content we produce.",
        },
    ];

    return (
        <section className="py-24 px-4 bg-lumina-black relative">
            {/* Gradient Divider */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-16 text-white">Trusted by Creators</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review, i) => (
                        <div key={i} className="glass-panel p-8 rounded-2xl relative">
                            <div className="text-4xl text-gray-700 font-serif absolute top-4 left-4">"</div>
                            <p className="text-gray-300 mb-6 italic relative z-10 pt-4">
                                {review.quote}
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500"></div>
                                <div>
                                    <div className="font-bold text-white text-sm">{review.name}</div>
                                    <div className="text-xs text-gray-500">{review.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Reviews;
