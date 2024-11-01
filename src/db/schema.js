const USER_TABLE = {
    name: "user",
    columns: [
        {
            name: "id",
            type: "uuid",
            primary_key: true,
            not_null: true,
            unique: true
        }
    ]
}
const WORKSPACE_TABLE = {
    name: "workspace",
    columns: [
        {
            name: "id",
            type: "uuid",
            primary_key: true,
            not_null: true,
            unique: true
        },
        {
            name: "user",
            type: "uuid", 
            not_null: true,
            unique: true,
            references: {
                table: 'user',
                column: "id"
            }
        },
        {
            name: "title",
            type: "text",
            not_null: true,
            unique: true
        },
        {
            name: "description",
            type: "text"
        }
    ]
}
const schema = [
    USER_TABLE,
    // WORKSPACE_TABLE
]

export default schema 