jsのテスト環境
===
以下の組み合わせでいく。

* Jasmine
  * テスティングフレームワーク
* Karma
  * テストランナー
  * カバレッジレポートを出す
* Sinon.JS
  * Spy、Stub、Mockツール
* PhantomJS
  * レンダリング、JS実行エンジン
  * ブラウザなしで実行できるようにするツール


# 下準備

```sh
$ mkdir js-test-sample
$ cd js-test-sample
$ npm init
$ npm install gulp --save-dev
$ touch README.md
$ touch gulpfile.js
$ touch .gitignore
```

■.gitignore
```
node_modules/
dest/
```

```sh
$ npm install typescript browserify --save-dev
$ npm install gulp-typescript gulp-sourcemaps del --save-dev
$ touch tsconfig.json
```

■tsconfig.json
```javascript
{
  "compilerOptions": {
    "outDir": "dest/app",
    "target": "ES5",
    "module": "system",
    "sourceMap": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "removeComments": false,
    "noImplicitAny": true,
    "suppressImplicitAnyIndexErrors": true
  },
    "filesGlob": [
        "./**/*.ts",
        "!./node_modules/**/*.ts"
    ],
    "files": [
        "./app/**/*.ts"
    ]
}
```

■gulpfile.js
```javascript
const gulp = require('gulp');
const typescript = require('gulp-typescript');
const tsConfig = require('./tsconfig.json');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

// clean the contents of the distribution directory
gulp.task('clean', function () {
  return del('dest/**/*');
});

// TypeScript compile
gulp.task('compile', ['clean'], function () {
  return gulp
    .src(tsConfig.files)
    .pipe(sourcemaps.init())          // <--- sourcemaps
    .pipe(typescript(tsConfig.compilerOptions))
    .pipe(sourcemaps.write('.'))      // <--- sourcemaps
    .pipe(gulp.dest('dest/app'));
});

gulp.task('build', ['compile']);
gulp.task('default', ['build']);
```


# テスト環境構築
```sh
$ npm install -g jasmine
$ npm install -g karma-cli
$ npm install -g tsd
$ npm install karma jasmine phantomjs-prebuilt phantomjs karma-jasmine karma-phantomjs-launcher karma-typescript-preprocessor gulp-karma --save-dev
$ jasmine init
$ karma init
Which testing framework do you want to use ?
Press tab to list possible options. Enter to move to the next question.
> jasmine

Do you want to use Require.js ?
This will add Require.js plugin.
Press tab to list possible options. Enter to move to the next question.
> no

Do you want to capture any browsers automatically ?
Press tab to list possible options. Enter empty string to move to the next quest
ion.
> PhantomJS
>

What is the location of your source and test files ?
You can use glob patterns, eg. "js/*.js" or "test/**/*Spec.js".
Enter empty string to move to the next question.
>

Should any of the files included by the previous patterns be excluded ?
You can use glob patterns, eg. "**/*.swp".
Enter empty string to move to the next question.
>

Do you want Karma to watch all the files and run the tests on change ?
Press tab to list possible options.
> yes


Config file generated at "C:\workspace\js-test-sample\karma.conf.js".
```

「tsd」は、「TypeScript Definition manager」の略で、TypeScriptの型定義を管理するためのツール。  
JasmineをTypeScriptで使用する場合、厳密な型定義のTypeScriptでは使用するライブラリ用の型定義を最初に行うのは面倒。  
tsdを使えば、tsdで管理されている型定義を難無く入手できる。  
下記では、tsdの初期化、Jasmineの型定義の検索（tds query）、導入を行っている。

```sh
$ tsd init
-> written tsd.json
-> written typings\tsd.d.ts
$ tsd query jasmine
 - jasmine / jasmine
$ tsd query jasmine --save --resolve --action install
 - jasmine / jasmine
>> running install..
>> written 1 file:
    - jasmine/jasmine.d.ts
```
「tsd query」コマンドで「--save」オプションをつけると「typings/tsd.d.ts」ファイルに導入した型定義ファイルが保存される。  
  
■gulpfile.js
```javascript
const karma = require('gulp-karma');
 
gulp.task('karma', () => {
    return gulp.src([
          // ライブラリも入れる必要がある。
          // 'bower_components/angular/angular.js',
          // 'bower_components/angular-mocks/angular-mocks.js',
          'app/typescript/*.ts',
          'spec/*.ts'
        ])
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }));
});
```

■karma.conf.js
```javascript
preprocessors: {
},
typescriptPreprocessor: {
    // options passed to the typescript compiler
    options: {
        sourceMap: false,     // (optional) Generates corresponding .map file.
        target: 'ES5',        // (optional) Specify ECMAScript target version: 'ES3' (default), or 'ES5'
        module: 'commonjs',   // (optional) Specify module code generation: 'commonjs' or 'amd'
        noImplicitAny: false, // (optional) Warn on expressions and declarations with an implied 'any' type.
        noResolve: false,     // (optional) Skip resolution and preprocessing.
        removeComments: true  // (optional) Do not emit comments to output.
    },
    // extra typing definitions to pass to the compiler (globs allowed)
    typings: [
        'typings/jasmine/jasmine.d.ts' // tsdで導入した定義ファイル
    ]
},
```

■app/typescript/math.ts
```typescript
function add(x, y) {
  return x + y;
}
```

■spec/math-test.ts
```typescript
/// <reference pah="../typings/jasmine/jasmine.d.ts" />

describe('math.add test', function() {
  it('1 + 1', function() {
      expect(add(1, 1)).toEqual(2);
  })
})
```

`gulp karma`でテスト実行。

## カバレッジを取得する。
```sh
$ npm install karma-coverage --save-dev
```

■karma.conf.js
```javascript
preprocessors: {
  'app/typescript/*.ts' : 'coverage'
},
```
```javascript
reporters: ['progress', 'coverage'],
```

`gulp karma`でテスト実行。  
「coverage」ディレクトリが作成され、HTMLのレポートが入ってる。  
.gitignoreに「coverage/」を追加する。