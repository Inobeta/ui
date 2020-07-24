# How to package


if you created a new element (component, service, model, etc..) add it to ```public_api.ts```

edit version attribute in package.js

compile package
```
npm run packagr
```
cd to output dir: 
```
cd dist/
```
compress pkg: 
```
npm pack
```
copy output package to client project: 
```
cp inobeta-ui-0.0.4.tgz ../../RezonaGUI/src/lib/
```
in client project, install pkg: 
```
npm i --save src/lib/inobeta-ui-0.0.4.tgz
```
import any element from root module: 
```javascript
import {StateAction} from 'inobeta-ui';
```



Setup del registry di gitlab:
```
npm config set @inobeta:registry https://gitlab.com/api/v4/packages/npm/
npm config set '//gitlab.com/api/v4/packages/npm/:_authToken' "GITLAB_TOKEN"
npm config set '//gitlab.com/api/v4/projects/8604184/packages/npm/:_authToken' "GITLAB_TOKEN"


npm publish
```
