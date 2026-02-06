import { memo } from 'react'
import { ChevronRight } from 'lucide-react'
import type { DrawerItem } from './ExploreMap'

interface DrawerListItemProps {
    item: DrawerItem
    onClick: (item: DrawerItem) => void
}

const DrawerListItem = memo(function DrawerListItem({ item, onClick }: DrawerListItemProps) {
    return (
        <button
            onClick={() => onClick(item)}
            className="w-full border-b border-gray-100 last:border-b-0 text-left hover:bg-gray-50 transition-colors"
        >
            <div className="p-4 flex gap-3">
                {/* Image */}
                <div className="flex-shrink-0">
                    <img
                        src={item.image_url}
                        alt={item.spot}
                        className="w-24 h-24 object-cover rounded-xl"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-base text-gray-900 mb-0.5 line-clamp-1">
                            {item.spot}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-400 mt-0.5" />
                    </div>

                    <p className="text-xs text-gray-500 mb-1.5">
                        {item.location}, {item.country}
                    </p>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                    </p>

                    {/* Enriched Content Pills */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {item.price_level && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {item.price_level}
                            </span>
                        )}
                        {item.highlights && item.highlights.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {item.highlights.length} Highlights
                            </span>
                        )}
                        {item.activities && item.activities.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                {item.activities.length} Activities
                            </span>
                        )}
                        {item.tips && item.tips.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                {item.tips.length} Tips
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    )
})

export default DrawerListItem
