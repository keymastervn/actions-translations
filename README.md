# Actions for Translations (t10n)

TBD
# Development

Bump actions by adding a tag v1.1, like this

```bash
git add action.yml index.js node_modules/* package.json package-lock.json README.md
git commit -m "My first action is ready"
git tag -a -m "My first action release" v1.1
git push --follow-tags
```

So in the workflow, we can use version 1.1

```yml
  - uses: X/actions-translations@v1.1
```
