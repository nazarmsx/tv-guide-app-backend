#Как подключить или скачать jQuery 3.3.1

Для установки jQuery 3.3.1 рекомендуется использвать npm или GitHub. Если  вы пользуэетесь сервисом CDN, сборки jQuery отличаются только номером версии.

## Скачать jQuery 3.3.1

Вы можете скачать необходимые фалы с CDN предоставляемого jQuery, или подключ скрипт исролбзуя ссылку.
https://code.jquery.com/jquery-3.3.1.js

https://code.jquery.com/jquery-3.3.1.min.js

Если вы используэте npm

npm install jquery@3.3.1
Если вы используэте Yarn
yarn add jquery@3.3.1

Чтобы сказать jQuery с помощью Bower

bower install jquery
Ета команда установит необходимые все необходимые файли в папку bower_components. В подкаталоге bower_components/jquery/dist/ можно будет найти минифицированную и не минифицированную версиию а также map file.
## jQuery Slim build

Иногда вам не нужно делать ajax запросы, или вы предпочытаете использоавть отдельные библиотеки для этих целей, например request,axios, или модуль $http в AngularJS. По этому вместе с стандартной сборкой jQuery, котороя содержит подмодули ajax, и анимационных ефектов, предоставляется урезання('slim') версия. В наше время размер билиотеки jQuery кажется крошечным по сравнению с другими фреймворками и библиотеками, но все же можно уменшить нагрузку на сервер используя slim  сборку, которая весит всего 6kb при использовании gzipp сжатия, обычная версия весит 24 килобайта. slim достпуна по ссылке и npm пакете.
https://code.jquery.com/jquery-3.3.1.slim.js
https://code.jquery.com/jquery-3.3.1.slim.min.js

Изминения в jQuery 3.3.0
Теперь методы .addClass(), .removeClass(), и .toggleClass() принимают как параметр масив класов.

jQuery('section.main').addClass(['main-content','bg-main']);

Изминения в jQuery 3.2.0

Добавлена поддержка кастомных CSS свойств
<div style="--margin: 10px; margin: var(--margin)">Some content</div>
<script>
$('div').css('--margin') ; // should return 10
$('div').css('--margin',20') ; // should change block margin to 20

Методы jQuery.holdReady,jQuery.nodeName,jQuery.isArray стали deprecated

Исправлена ошибка в методах .width(), .height() и других связаных методах где учитавались CSS transforms свойства. Например, елемент со стилем transform: scale(3x) не должен иметь высоту и широту в три раза больше.

Добавлена поддержка елемента <template> в методе .contents().

Изминения в jQuery 3.0

jQuery.Deferred теперь совместим с Promises/A+
Обекты класа jQuery.Deferred теперь совместимы с  Promises/A+ и промисами ES2015. Всем кто использовал этот метод ранне, нужно будет внести зминения, или заменить его на метод pipe. Также исключение выброшеноє в колбек  .then() теперь становится значением reject. Все обьекти deferred котрые базировались на то что будет выброшено исключения никогода не будут выполены (resolved).
```javascript
let deferred = jQuery.Deferred();
deferred.then(function() {
  console.log("first promise");
  throw new Error("Some error occured");
})
.then(function() {
  console.log("second promise");
}, function(err) {
  console.log("rejection promise", err instanceof Error);
});
deferred.resolve();
```
Раньше первый промис выполнялся и далее выбрасивлось исключения, и дальнееше выполнениее прекращалось. Связи с требованиями стандарта, выполнсятся все три кобека.

Колбеки будут выполнятся асинхронно, не смотря на то Deferred был resolved
```javascript
let defer = jQuery.Deferred();
defer.resolve();
defer.then(function() {
  console.log("success message");
});
console.log("after message");
```
Раньше в консоль бы вывелось "success message" потом "after message",а в последней версии наоборот.

К Deferred был добавлен метод catch()

Анимации теперь используют requestAnimationFrame
В браузерах что поддержывают requestAnimationFrame будет использоватся это API  для управления анимациями. Что уменшит использование ресурсов CPU и увеличит время работы батаерии на мобильных устройствах

 Увеличена производительность кастомных слекоров.

 Для некотрых селектора например таких как :visible скорость работы была увеличена в 17 раз


