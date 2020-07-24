# How to version

Daily version (before each commit)
```
npm run pre-release
```

Bug fixes
```
npm run patch
```

New feature
```
npm run minor
```

Breaking changes
```
npm run major
```

Setup gitlab registry  (manual)
```
npm config set @inobeta:registry https://gitlab.com/api/v4/packages/npm/
npm config set '//gitlab.com/api/v4/packages/npm/:_authToken' "GITLAB_TOKEN"
npm config set '//gitlab.com/api/v4/projects/8604184/packages/npm/:_authToken' "GITLAB_TOKEN"


npm publish
```
