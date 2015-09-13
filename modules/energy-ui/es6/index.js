import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import './style.css';
import m from 'mithril';
import _api from 'energy-api';
const api = _api({baseUrl: 'http://localhost:9080'});
const vm = {
  username: m.prop(''),
  password: m.prop(''),
  loggedUser: m.prop(''),
  async login() {
    const logged = await api.login(vm.username(), vm.password());
    if (logged) {
      vm.loggedUser(vm.username());
    }
  }
};

const loginModule = {
  controller() {},
  view() {
    return m('body', [
      m('div.form-group', [
        m('label', {for: 'username'}, 'Username'),
        m('input#username',
          {
            onchange: m.withAttr('value', vm.username),
            value: vm.username()
          }
        )
      ]),
      m('div.form-group', [
        m('label', {for: 'password'}, 'Password'),
        m('input#password',
          {
            onchange: m.withAttr('value', vm.password),
            value: vm.password(),
            type: 'password'
          }
        )
      ]),
      m('button', {class: 'btn btn-success', onclick: vm.login}, 'Login'),
      m('p', vm.loggedUser())
    ]);
  }
};

/*
// for simplicity, we use this component to namespace the model classes

// the Todo class has two properties
function Todo(data) {
  this.description = m.prop(data.description);
  this.done = m.prop(false);
}

// the TodoList class is a list of Todo's
const TodoList = Array;


const todoModule = {
  // the view-model tracks a running list of todos,
  // stores a description for new todos before they are created
  // and takes care of the logic surrounding when adding is permitted
  // and clearing the input after adding a todo to the list

  vm: {
    list: new TodoList(),

    // a slot to store the name of a new todo before it is created
    description: m.prop(''),

    add() {
      if (todoModule.vm.description()) {
        todoModule.vm.list.push(new Todo({description: todoModule.vm.description()}));
        todoModule.vm.description('');
      }
    }
  },


  // the controller defines what part of the model is relevant for the current page
  // in our case, there's only one view-model that handles everything
  controller() {

  },

  view() {
    return m('body', [
      m('input', {onchange: m.withAttr('value', this.vm.description), value: this.vm.description()}),
      m('button', {class: 'btn btn-success', onclick: this.vm.add}, 'Add'),
      m('table', [
        this.vm.list.map(task =>
          m('tr', [
            m('td', [
              m('input[type=checkbox]', {onclick: m.withAttr('checked', task.done), checked: task.done()})
            ]),
            m('td', {style: {textDecoration: task.done() ? 'line-through' : 'none'}}, task.description())
          ])
        )
      ])
    ]);
  }
};
*/

// initialize the application
m.mount(document.body, loginModule);
