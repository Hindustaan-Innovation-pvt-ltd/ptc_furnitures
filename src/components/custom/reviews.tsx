const reviews = [
    {
        name: "Tushar Mehta",
        review: "The Tusk Lounge Chair transformed our reading nook. The wool fabric is exquisite — incredibly comfortable and beautifully made.",
        rating: 5,
        location: "Raipur",
        product: "FR · Tusk Lounge Chair"
    },
    {
        name: "Rahul Sharma",
        review: "PTC's curation is unparalleled. We furnished our entire apartment through them and every single piece exceeded our expectations.",
        rating: 5,
        location: "Raipur",
        product: "IJS Ravenna Sectional"
    },
    {
        name: "Suryakant Sahu",
        review: "The Oslo Dining Table is a work of art. Solid oak, perfect proportions, and it has held up beautifully for over two years now.",
        rating: 5,
        location: "Raipur",
        product: "JP · Oslo Dining Table"
    }
]

export default function Reviews() {
    return (
        <div className='mx-auto max-w-7xl px-4 py-20 text-center transition-colors duration-300 sm:px-6 lg:px-8 lg:py-28'>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">reviews</span>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl">What Our <span className="text-red-800 dark:text-red-600">Customers</span> Say</h1>
            <div className='mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                {reviews.map((review, index) => (
                    <div key={index} className='flex flex-col gap-4 rounded-lg border border-slate-200/80 bg-white p-5 text-left shadow-md shadow-black/5 dark:border-white/10 dark:bg-[#111318] dark:shadow-black/20 sm:p-6'>
                        <div className='flex items-center'>
                            {
                                Array.from({ length: review.rating }).map((_, i) => (
                                    <svg key={i} width="20" height="20" className='size-4 fill-red-800' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L14.7553 8.09017L21.2132 8.90983L16.6066 13.9098L18.3629 20L12 15.0902L5.63708 20L7.39335 13.9098L2.78679 8.90983L9.24468 8.09017L12 2Z" />
                                    </svg>
                                ))
                            }
                        </div>
                        <p className="text-start text-sm text-gray-600 dark:text-gray-300">"{review.review}"</p>
                        <div className='mt-2 border-t border-slate-200 dark:border-white/10 flex flex-col items-start pt-2'>
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-50">{review.name}</h3>
                            <div className='flex flex-wrap items-center gap-x-1 text-xs text-gray-500 dark:text-gray-400'>
                                <p>{review.location}</p>
                                <span>•</span>
                                <p>{review.product}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

