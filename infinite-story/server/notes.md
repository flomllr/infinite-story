## Selling Stuff
- New table: id, user_id, created_at, updated_at, used_all_time, used_last_week, bought_all_time, revenue_all_time, item, price, soft_delete, nsfw
- New achievement type: "boughtmarketplaceitem:12121212:Squire:flomlrr"
- New API requests:
    - get_all_marketplace_items
    - get_marketplace_items (send an array of marketplaceitemsid)
    - buy_marketplace_item (auth using the device_id, sends a marketplaceitem id, add a new achievement and returns the name of that achievement)
    - add_class_to_shop (send a prompt id and a price)
    - deactivate_marketplace_item (send an id of a marketplace item)
    - restore_marketplace_item (send an id of a marketplace item)
    - get_my_marketplace_items (auth using the device_id)
    - update_marketplace_item (send new price)
## Struct of marketplace item
{
    "type": "CLASS" | "PROFILE_PICTURE",
    "item": {
        "portrait": String | PixelArt,
        "location": String,
        "name: String,
        "description": String,
        "context": String,
        "prompts": String[],
        "grammar": Object | null,
        "keywordInjecter": Object | null
    }
}
