# eshose

> 🦜 adds documents to a `tweets` index in elasticsearch, drinking from the twitter firehose

```
npm i -g eshose
```

create an `~/.eshose` file like:

```json
{
  "ELASTICSEARCH_HOST": "https://user:pass@localhost:9200",
  "TWITTER_SEARCH_TERMS": "trump",
  "TWITTER_CONSUMER_KEY": "PASTE_YOUR_CONSUMER_KEY_HERE",
  "TWITTER_CONSUMER_SECRET": "PASTE_YOUR_CONSUMER_SECRET_HERE",
  "TWITTER_ACCESS_TOKEN_KEY": "PASTE_YOUR_ACCESS_TOKEN_KEY_HERE",
  "TWITTER_ACCESS_TOKEN_SECRET": "PASTE_YOUR_ACCESS_TOKEN_SECRET_HERE"
}
```

run:

- `eshose`
- `eshose "some other search query"`
- `TWITTER_SEARCH_TERMS="some other search query" eshose`

# license

mit
