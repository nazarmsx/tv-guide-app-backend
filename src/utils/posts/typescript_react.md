#Написания React приложения на TypeScript

TypeScript это язык с откритым исходным кодом, разрабатываемый и поддержываемый Microsoft. TypeScript это надмножество языка JavaScript с более строгой статической типизацией, большими возможностями для обьектно-ориентированого программирования. Сегодня мы расмотрим как использовать TypeScript вместе с React.

Чтобы создать новое проект с помощью Create React App с включеноой поддержкой TypeScript, выполните слдеующую команду

[code language="bash"]
npx create-react-app super-new-app --typescript
# or
yarn create react-app super-new-app --typescript
[/code]

Если вы раннее устанавливали пакет *create-react-app* глобально командой *npm install -g create-react-app*, рекомендуется удалить этот пакет командой *npm uninstall -g create-react-app* чтобы *npx* всегда использовал последнюю версию.

Чтобы добавить  TypeScript в проект созданный Create React App, нужно установить некотрые пакети

[code language="bash"]
npm install --save typescript @types/node @types/react @types/react-dom @types/jest
# or
yarn add typescript @types/node @types/react @types/react-dom @types/jest
[/code]

Дальше необходимо переименовать все JS файлы в файлы с расширением *.ts*, например src/index.js в src/index.tsx) і перезапустить dev-сервер.
Ошыбки типов должны появиться в консольном окне билд скрипта.
Чтобы более детально ознакомиться с TypeScript, перейдите на их сайт и почитайте документацию https://www.typescriptlang.org/

## Частые проблемы
-  Если ваш проект уже создан без поддержки TypeScript, npx может использовать закешырованую версию *create-react-app*. Удалите раннее установленую версию командой *npm uninstall -g create-react-app*
- Вам не обязательно создавать *tsconfig.json*  файл, он будет создан автоматически. Также вы можете измемить сгенрированый архив так как вам нужно.
- Если вы сейчас используете *create-react-app-typescript*  https://github.com/wmonk/create-react-app-typescript/,   эта статья https://vincenttunru.com/migrate-create-react-app-typescript-to-create-react-app/ поможет вам мигрировать до Create React App.


## Использования Webpack в сборке  React TypeScript приложении

Если вы создает проект с нуля, взгляните сначала на шаблон https://www.typescriptlang.org/samples/index.html

### Для начала нужно создать директорию проекта. Давайте назвем ее *new-app*, но вы можете поменять ее как хотите.
[code language="bash"]
mkdir new-app
cd new-app
[/code]

Структура проекта будет следущией
[code language="bash"]
mkdir new-app
new-app/
├─ dist/
└─ src/
   └─ components/
[/code]

TypeScript файлы будут лежать в папке *src*, после компиляции они окажуться в файле bundle.js в паке dist. Все компоненты которые будут создаваться поместим в папку  src/components
Давайте создаим необходиміе паки
[code language="bash"]
mkdir src
cd src
mkdir components
cd ..
[/code]
Webpack  создаст папку dist после первой сборки.
### Инициализация проекта
Запусите следуюющую команду
[code language="bash"]
npm init
[/code]
У вас будет несколько промтов, используйте дефолтный настройки, вы всегда сможете их поменять в package.json сгенерованом для вас.
### Установка зависимостей
Сначала убедитесь что *Webpack* установлен глобально
[code language="bash"]
npm install -g webpack
[/code]
*Webpack* ето утилита для ссборки вашего кода и/или всех его зависисмостей в один *.js* файл.
Дальше добавляем библиотеки React и React-DOM вместе с файлам декларации типов
[code language="bash"]
npm install --save react react-dom @types/react @types/react-dom
[/code]
Также необходимо установить пакеты которы пондобятся на етапе разработки.
[code language="bash"]
npm install --save-dev typescript awesome-typescript-loader source-map-loader
[/code]

Ети библиотеки помогут TypeScript  и webpack работать вместе. awesome-typescript-loader поможет Webpack  скомпилировать вам TypeScript  код испольщзую стандратний фалй конфигурации tsconfig.json.
source-map-loader сгенерирует sourcemap  для удобства в отладке.

### Напишем немного кода
Код компонента
[code language="html"]
import * as React from "react";

export interface HelloProps { compiler: string; framework: string; }
export class Hello extends React.Component<HelloProps, {}> {
    render() {
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>;
    }
}
[/code]

Код index.tsx
[code language="html"]
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Hello React!</title>
    </head>
    <body>
        <div id="example"></div>

        <!-- Dependencies -->
        <script src="./node_modules/react/umd/react.development.js"></script>
        <script src="./node_modules/react-dom/umd/react-dom.development.js"></script>

        <!-- Main -->
        <script src="./dist/bundle.js"></script>
    </body>
</html>
[/code]
Обратите внимание, что мы включаем файлы из node_modules. Пакеты React и React-DOM npm включают в себя отдельные файлы .js, которые вы можете включить в веб-страницу, и мы ссылаемся на них напрямую, чтобы ускорить процесс.

И завершальним етап является создания webpack.config.js файла.
[code language="javascript"]
module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
};
[/code]