# Message Timestamp

Adds timestamps to outgoing prompt messages.

## Settings

- **Enabled**: Whether to enable the extension or not. When disabled, the extension will not modify messages in any way. Default: `false`.
- **Timestamp format**: The format of the timestamp, using [Moment.js formatting](https://momentjs.com/docs/#/displaying/). Default: `YYYY-MM-DD HH:mm:ss`.
- **Message format**: The format of the final message, where `{{timestamp}}` will be replaced with the formatted timestamp, and `{{message}}` will be replaced with the original message. Supports all other [standard macros](https://docs.sillytavern.app/usage/core-concepts/macros/#common-macros-by-category). Default: `[{{timestamp}}] {{message}}`.

## License

AGPL-3.0 License
