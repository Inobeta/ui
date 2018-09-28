# How to package


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
