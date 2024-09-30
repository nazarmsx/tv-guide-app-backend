# Vue.js 2 interview  questions
**1) On what design pattern Vue is based on?**

Vue.js is based on Model-View-ViewModel(aka as MVVM) design pattern, main motivation for this pattern is a separation model from view.

**2) How to pass data to component?**

There is two ways: using props or through events.

```html
<my-awesome-component some-prop="value"></my-awesome-component>
```

When you need to pass data after some specific event you should use dispatchers and broadcasters.

```html
<parent-component>
    <some-child></some-child>
    <another-child></another-child>
</parent-component>
```
To dispatch event from two child components use following syntax
```javascript
this.$dispatch('something_happen', data);
// Event listener
{
events: {
    something_happen: function(data){
        // Handle event
    }
}}
```
**3) What component lifecycle hooks in Vue.js?**

beforeCreate, created, beforeMount, mounted,beforeUpdate,updated,activated,deactivated,beforeDestroy,destroyed,errorCaptured

**4) How to updated component state in Vue**

To  add or update reactive property in state use method Vue.set(object, key, value), you can call it using this.

```javascript
this.$set(this.user, 'first_name', 'John')
```

**5) What is computed properties and when to use them ?**

Computed properties is a functions which returns somehow changed simple properties, for example, you have some text property and you need to show it in uppercase mode, so instead storing two props with original and uppercased text, you just write function which computes needed value based on original property.

```html
<div id="root">
  <p>Original message: "{{ someMessage }}"</p>
  <p>Message in uppercase : "{{ uppercasedMessage }}"</p>
</div>
```
```javascript
var vm = new Vue({
  el: '#root',
  data: {
    someMessage: 'Hello world!'
  },
  computed: {
    // computed property getter
    uppercasedMessage: function () {
      return this.message.toUpperCase()
    }
  }
})
```

**6) How to import external css file into Vue ?**
If you are using webpack use following syntax:
```html
<style>
  @import './assets/styles/bootstrap.css';
</style>
```
If you prefer old-school style just <style> tag.

```html
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
```
**7) How use jQuery plugin ?**

Generally it's not recommended practise to use jQuery plugin in Vue applications, however if there is no such suitable components & libraries, you can use it.
First of all import jQuery and plugin.
```javascript
import $ from 'jquery'
import TextEditor from 'TextEditor'
```
Then you need initialize plugin in mounted component lifecycle hook.
```javascript
import $ from 'jquery'
import TextEditor from 'TextEditor'
```
export default class MyComponent extends Vue {
 mounted(){
  $(componentId).textEditor({
         rows:20,
         cols:10
     });
 }
}

**8) How register component in Vue.js ?**

To register component globally use following syntax.
```javascript
Vue.component('my-awesome-component', { /* ... some options */ })
```
First argument is name of your new component

To register component locally use *components* during creation new Vue instance.

```javascript
new Vue({
  el: '#app',
  components: {
    'header': Header,
    'footer': Footer
  }
})
```

**9)What is Vuex ?**

Vuex is a state management pattern and library for Vue.js apps. It designed to be main data storage for all app components and guarantee predictability of reactive data changes.

**10)How to conditionally render component?**

Use v-if and v-else directives, component wil be removed from dom if you pass false condition to it. To save element in DOM v-show directive can be used, it changes display css property

```html
<p v-if="true">Visible</p>
<p v-else>Not visible</p>
```
**11)Does Vue.js support data binding? If yes how to use it?**

Yes Vue.js supports data binding, to bind input and state v-model directive should be used.
```html
<input v-model="name" placeholder="What is your name?">
<p>Hello, {{ name }}!</p>
```
**12) How to implement client side routing in Vue?**

Recommended way to make SPA is to use Vue Router, which is official library for routing, but not include in core framework.

**13)How to redirect programmatically in Vue Router?**

To redirect programmatically use router.push(location, onComplete?, onAbort?)
```javascript
function logOut (){
    userService.removeCurrentSession();
    this.$router.push('/login');
}
```
Also it's possible go back to some point in history stack using router.go(n) method

**14) How to protect some route from unauthorized access?**

It's can be done inside component or in global gards.

```javascript
const router = new VueRouter({ ... })

router.beforeEach((to, from, next) => {
  if(to.isProtected() && !haveAccess(user)){
    next(false)
  }
  next()
})
```

# React Native interview  questions
**1) What is React Native? How does it work?**

React Native is a JS framework for creating native mobile apps for iOS and Android. It works through bridging between

# React.js interview  questions
**1) How to force React component to rerender?**

The easiest way to rerender component is to change it's props. Also you can do it using this.setState method. Finally method this.forceUpdate can initiate eleme rerender. It is worth mention that two first ways at first call shouldComponentUpdate() methods, so If you need forced rerender use  forceUpdate method.

**2) Name lifecycle methods of component?**

Every React component pass number of stages of the life cycle, during which such methods being invoked:

* constructor(props): initialization of component
* componentWillMount(): is invoked just before rendering of the component
* render(): method responsible for rendering
* componentDidMount(): method is invoked after rendering of the component
* componentWillUnmount(): is called before the component is removed from the DOM

**3) What methods of component might be invoked after some state changes?**

* shouldComponentUpdate(nextProps, nextState): is called whenever state or props were changed. As parameters gets new props object and state. If this functions returns true component will be re-rendered
* componentWillUpdate(nextProps, nextState): is invoked if shouldComponentUpdate returned true
* componentDidUpdate(prevProps, prevState): is called just after component update

**4) Why is important to use keys for list rendering ?**

Keys help React identify which elements have changed, added or removed. Keys gives list elements stable identity. Also using keys have good affect on performance.

**5) How to handle button click event in React.js ?**

Pass you handle function to onClick prop of the element.

```jsx
<button onClick={deleteUser}>
  Delete user
</button>
```

**6) How to pass a parameter to an event handler or callback? ?**

There is two ways: wrap event handled in arrow functions and pass all needed args or use JS functions method bind. 

```jsx
<button onClick={() => this.deleteUser(id)} />
<button onClick={this.deleteUser.bind(this, id)} />
```

**7) What will happen if you pass function to setState method ?**

Passed function will be called with current state as an argument, this feature is very useful if you want update state consistently.

```javascript
updateBalance(amount) {
  this.setState((prevState) => {
    // Important: read `prevState` instead of `this.state` when updating.
    return {amount: prevState.amount + amount}
  });
}
handleTransaction(){
    this.updateBalance(10);
    this.updateBalance(30);
    this.updateBalance(50);
    // this.state.amount is now zero, but when component re-renders it will be 80 
}
```

**8) What is lifting state up in React?**

Usually, some components need to respond to same events or state changes, so there is some way needed to notify all this component when something changed. The recommended way to do it is lifting state up.
This means that shared state should be lifted up to the closest common ancestor. This method based on there should be single “source of truth” for any data that changes in a React application. 

**9) How to get input value ?**

There is no method to get input value directly, but it can be persisted in state using onChange event handler.
```jsx
 <input value={this.state.inputValue} onChange={this.updateInputValue}/>
```
Another way to do it use React refs, which provides direct access to DOM nodes or React components.

```jsx
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    this.getInputValue = this.getInputValue.bind(this);
  }
  getInputValue() {
    this.textInput.current.value;
  }

  render() {
    return (
      <div>
        <input
          type="text"
          ref={this.textInput} />
      </div>
    );
  }
}
```

**10)What is a strict mode in React.js ?**

StrictMode is a tool for detection potential problem is application. StrictMode detects: components with unsafe lifecycles, legacy string ref API usage,unexpcted side effects, legacy context API.
To enable strict mode just add tag   <React.StrictMode> somewhere in your code.
```jsx
import React from 'react';

function MyApp() {
  return (
    <div>
      <Header />
      <React.StrictMode>
        <Section>
          <Post />
          <CommentBox />
        </Section>
      </React.StrictMode>
      <Footer />
    </div>
  );
}
```

**11)What is Portals ?**

Portals provide a first-class way to render children into a DOM node that exists outside the DOM hierarchy of the parent component.

**12)In what lifecycle method HTTP request should be made ?**

It's recommended to make HTTP requests inside componentDidMount method 

**13)What is pure component and when it should be used ?**

PureComponent automatically checks whether component should update, so you don't need write shouldComponentUpdate by yourself. PureComponent will call render only if detects changes in props or state.
In some cases React.PureComponent is more effective, and definitely reduce amount of code. 

**14)How to do conditional render in React.js?**
For small render functions use can return different result for example using if operator
```jsx
function Header(props) {
  const isLoggedIn = props.isLoggedIn;
  if (isLoggedIn) {
    return <UserProfileIcon/>;
  }
  return <AnonymousProfileIcon />;
}
```

For more complex deeply nested JSX render function, logical operator can be used.

```jsx
function App(props) {
  const isLoggedIn = props.isLoggedIn;
  return (
         <div>
         <Header/>
         <Post/>
         {isLoggedIn && <CommentBox/>}
         <Footer/>
         </div>
            );
}
```
 
**15)How to build React project in production mode?**
 
If you are using Webpack, utilize DefinePlugin method and set environment variable NODE_ENV to production. 

**16)Where to initialize state?**

The most popular way is to initialize state inside constructor. Also you can define initial state for a component in getInitialState method.

```jsx
class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    isLaoding:true
    }
   }
}
```
getInitialState example usage:
```jsx
var Counter = createReactClass({
  getInitialState: function() {
    return {count: 0};
  }
});
```
**17)What are higher-order components in React.js?**

A higher-order component is function that takes component and return new component, it's similar to higher order functions. HOC can is great way to reuse component logic. Also worth noting that HOC is not a part of React API it's just design pattern.

```jsx
const CommentComponentOnSteroids = higherOrderComponent(CommentComponent);
```

**18)When getDerivedStateFromProps(props, state) method should be used?**

Method getDerivedStateFromProps is suitable for cases, when state depends on changes over time. This method is called just before render method, during initial mount and  following updates.  

**19)What is PropTypes and how to use it?**

prop-types it's a library for runtime type checking for React props and similar objects. This lib is very useful in big projects, because it reduces quantity of potential errors.

```jsx
import PropTypes from 'prop-types';

class SayHello extends React.Component {
  render() {
    return (
      <h1>Hello, {this.props.firstName} {this.props.lastName}!</h1>
    );
  }
}
Greeting.propTypes = {
  firstName: PropTypes.string,
  lastName : PropTypes.string,
};
```

**20) What is stateless components?**

Stateless component is just a plain javascript function which takes props as an argument and returns a react element.

```jsx
class StatelessComponent extends React.Component {
  render() {
    return <div>{this.props.someProp}</div>;
  }
}
```

