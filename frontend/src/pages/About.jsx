import React from "react";

const About = () => {
    return (
        <div className="min-h-screen bg-gray-100 pb-24">
            <div className="max-w-2xl mx-auto bg-white mt-6 p-6 rounded-lg shadow-md text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-green-100 rounded-full p-3">
                        <span className="text-3xl">🌿</span>
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-green-800 mb-1">About Rooted</h1>
                <p className="text-gray-600 mb-6">A mobile-first platform to catalog and care for plants</p>

                <h2 className="text-lg font-semibold text-left mb-2">Our Mission</h2>
                <p className="text-left text-gray-700 mb-4">
                    Rooted was created to help plant enthusiasts catalog and care for their green companions. Whether you're managing a farm, garden, or just a few houseplants, Rooted provides the tools to document, learn about, and properly care for each plant in your collection.
                </p>
                <p className="text-left text-gray-700 mb-6">
                    Using modern technology like QR codes and AI-powered insights, we're making plant identification and care more accessible and scientific, while keeping the experience simple and enjoyable.
                </p>

                <h2 className="text-lg font-semibold text-left mb-2">How It Works</h2>
                <div className="text-left space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">1</span>
                        <div>
                            <p className="font-semibold">Add Your Plants</p>
                            <p className="text-gray-700">
                                Upload a photo or enter the common name of your plant. Our AI will suggest care details that you can edit.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">2</span>
                        <div>
                            <p className="font-semibold">Access Plant Profiles</p>
                            <p className="text-gray-700">
                                View detailed care instructions, seasonal information, and uses for each plant in your collection.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">3</span>
                        <div>
                            <p className="font-semibold">Generate QR Codes</p>
                            <p className="text-gray-700">
                                Create unique QR codes for each plant that link directly to their care profile. Print and place them near your plants.
                            </p>
                        </div>
                    </div>
                </div>

                <h2 className="text-lg font-semibold text-left mb-2">About Aashiyana Kanwar Farms</h2>
                <p className="text-left text-gray-700">
                    Rooted was originally developed for Aashiyana Kanwar Farms, a sustainable agricultural project focused on preserving traditional farming practices while incorporating modern techniques.
                </p>
                <p className="text-left text-gray-700 mt-2">
                    The farm is home to hundreds of plant species, including medicinal herbs, fruits, vegetables, and ornamental plants, all cataloged and managed using the Rooted platform.
                </p>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around items-center py-2">
                <div className="text-center text-green-700">
                    <a href="/"><div>🏠</div><div className="text-xs">Home</div></a>
                </div>
                <div className="text-center text-green-700">
                    <a href="/add"><div>➕</div><div className="text-xs">Add Plant</div></a>
                </div>
                <div className="text-center text-green-700">
                    <a href="/about"><div>ℹ️</div><div className="text-xs">About</div></a>
                </div>
            </div>
        </div>
    );
};

export default About;