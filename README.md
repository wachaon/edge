# edge
*@wachaon/edge* は *wes* で *edge* の自動操縦を支援するモジュールです。

## 特徴

`edge` はブラウザの動作手続きを記述するだけではなく、*url* に対して *event* を設定していくイベント駆動型での操作を記述できます。
イベントの *url* には文字列以外に正規表現も設定できるので、柔軟な設定が可能になります。
自動操縦には不向きな場面も、あえて *url* を設定しないことで容易に手動操縦に切り替えれます。
エラーが発生した場合でも可能な限り安全に終了処理を行います。
ブラウザに対する実際の操作は [*@wachaon/webdriver*](https://github.com/wachaon/webdriver) を参照してください。

## インストール

```shell
wes install @wachaon/edge --unsafe --bare
```

*WebDriver* とブラウザは同じバージョンのものを使用する必要があります。

このモジュールをコマンドラインから `-d` もしくは `--download` オプションを指定して実行すると、ブラウザのバージョンとアーキテクチャーが同じ *WebDriver* をダウンロードし展開します。

```shell
wes edge --download
```

## 使い方

| argument | type | description |
|:---|:---:|:---|
| `callback` | *{Function}* | 実際の処理を記述します |
| `terminate` | *{Function}* | 終了時の処理を記述します |

*edge* は明示的に終了させるまで、待機状態を維持します。終了させるにはブラウザを閉じるか `navigation.emit('terminate')` を実行できる様にスクリプトを構成してください。

下記のコードを実行してください。
ブラウザを閉じるか `https://www.yahoo` から始まる *url* に訪問するまで、*url* をコンソールに表示します。

```javascript
const edge = require('edge.js')

edge((window, navi, res) => {
    window.rect({
        x: 1,
        y: 1,
        width: 1200,
        height: 500
    })
    res.exports = []

    navi.on(/^https?:\/\/www\.yahoo\b/, (url) => {
        console.log('finished!')
        navi.emit('terminate', res, window)
    })

    navi.on(/https?:\/\/.+/, (url) => {
        console.log('URL: %O', url)
        res.exports.push(url)
    })

    window.navigate('http://www.google.com')
})
```

### `callback(window, navigation, result)`

| argument | type | description |
|:---|:---:|:---|
| `window` | *{window}* | *window* を操作するクラス<br>*@wachaon/webdriver* の *window* クラスになります |
| `navigation` | *{event}* | *event* の *Pub/Sub* (出版・購読型)モデル |
| `result` | *{export}* | `result.export` にデータを入れることで、ファイルなどへの出力が容易になります |

### `terminate(message, result)`

`terminate()` は `navigation.emit('terminate')` が実行された時の挙動を記述します。既定値は *log* もしくはカレントディレクトリに `JSON.stringify(result.export)` の結果をファイルに出力します。
`message` は 終了時にコンソールに出力するメッセージになります。
