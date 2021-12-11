# Migration from creative version to party game version
- Add a status column (varchar) to users with a default value of "PEASANT"
- Create the partygames table using the same datastructure as the one on the dev server
- Add a story_metadata column (JSON) to stories
