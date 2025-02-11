import "./style.css";

const addTodoDialog = document.querySelector("#add-todo-dialog");
const editTodoDialog = document.querySelector("#edit-todo-dialog");
const addTodoBtn = document.querySelector("#add-todo-btn");
const dialogCloseBtn = document.querySelector("#dialog-close-btn");
const editDialogCloseBtn = document.querySelector("#edit-dialog-close-btn");
const addTodoForm = document.querySelector("#add-todo-form");
const todoList = document.querySelector("#todo-list");
const deleteTodoBtn = document.querySelector("#delete-todo-btn");
const editTodoForm = document.querySelector("#edit-todo-form");
const deleteAllBtn = document.querySelector("#delete-all-btn");
const sortByDateBtn = document.querySelector("#sort-by-date-btn");
const deleteSelectedBtn = document.querySelector("#delete-selected-btn");

deleteAllBtn.addEventListener("click", deleteAllTodos);
sortByDateBtn.addEventListener("click", () => {
  sortTodosByDate();
  alert("Todos sorted by date successfully!");
});
deleteSelectedBtn.addEventListener("click", deleteSelectedTodos);

async function deleteAllTodos() {
  const confirmDelete = confirm("Are you sure you want to delete all todos?");
  if (!confirmDelete) return;

  try {
    localStorage.removeItem("todos");
    todos = [];
    renderTodo(todos);
    todoList.previousElementSibling.classList.remove("hidden");
    alert("All todos deleted successfully!");
  } catch (error) {
    console.error("Error deleting todos:", error);
    alert("Error deleting todos. Check console for details.");
  }
}

async function getTodos() {
  const todos = JSON.parse(localStorage.getItem("todos")) || [];
  return todos.map((todo) => ({
    ...todo,
    createdAt: new Date(todo.createdAt),
  }));
}

let todos = await getTodos();

renderTodo(todos);
if (todos.length > 0) {
  todoList.previousElementSibling.classList.add("hidden");
} else {
  todoList.previousElementSibling.classList.remove("hidden");
}
addTodoBtn.addEventListener("click", () => {
  addTodoDialog.showModal();
});
dialogCloseBtn.addEventListener("click", () => {
  addTodoDialog.close();
});
editDialogCloseBtn.addEventListener("click", () => {
  editTodoDialog.close();
});
addTodoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const todoName = e.target["todo-name"].value;
  const todoDate = e.target["todo-date"].value;
  if (!todoName || !todoDate) return;

  const createdAt = new Date(todoDate); // Use the date provided by the user
  addTodo(todoName, createdAt);

  addTodoDialog.close();
  addTodoForm.reset();
});
todoList.addEventListener("click", async (e) => {
  if (e.target.parentNode.id === "todo-edit-btn") {
    const todoID =
      e.target.parentNode.previousElementSibling.children.item(0).id;
    openEditModal(todoID);
  }
  if (e.target.type === "checkbox") {
    const id = +e.target.id;
    todos = todos.map((todo) => {
      if (todo.todoID === id) {
        return { ...todo, isDone: !todo.isDone };
      }
      return todo;
    });
    saveTodos(todos);
    renderTodo(todos);
  }
});

deleteTodoBtn.addEventListener("click", deleteTodo);
editTodoForm.addEventListener("submit", editTodo);

async function addTodo(todoName, createdAt) {
  const newTodo = {
    todoName,
    isDone: false,
    todoID: Date.now(),
    createdAt,
  };

  todos = [...todos, newTodo];
  saveTodos(todos);
  renderTodo(todos);
  alert("Todo added successfully!");
  if (todos.length > 0) {
    todoList.previousElementSibling.classList.add("hidden");
  } else {
    todoList.previousElementSibling.classList.remove("hidden");
  }
}

function renderTodo(todos) {
  todoList.innerHTML = "";
  todos.map((todo) => {
    todoList.innerHTML += `
    <li class="flex justify-between" >
              <div class="flex items-center justify-center gap-4">
                <input type="checkbox" class="peer hidden" id=${todo.todoID} ${
      todo.isDone ? "checked" : ""
    } />
                <label
                  for=${todo.todoID}
                  class="size-10 rounded-full border-4 border-gray-500 peer-checked:bg-gray-500 cursor-pointer"
                >
                  <img src="./src/assets/icons/checkmark-outline.svg" />
                </label>
                <label for=${todo.todoID} class="${
      todo.isDone ? "line-through text-3xl text-gray-400" : "text-3xl"
    }">${todo.todoName}</label>
              </div>

              <button class="w-12" id="todo-edit-btn">
                <img src="./src/assets/icons/ellipsis-horizontal-sharp.svg" />
                <span class="sr-only">options</span>
              </button>
            </li>
    `;
  });

  saveTodos(todos);
}

function openEditModal(id) {
  const editForm = editTodoDialog.children.item(1);
  editForm.dataset.editId = id;
  const editTodo = todos.find((todo) => todo.todoID === +id);
  editForm.children.item(0).value = editTodo.todoName;
  editForm.children.item(1).value = editTodo.createdAt
    .toISOString()
    .split("T")[0];
  editTodoDialog.showModal();
}

async function deleteTodo() {
  const editId = +editTodoForm.dataset.editId;

  todos = todos.filter((todo) => todo.todoID !== editId);
  saveTodos(todos);
  renderTodo(todos);
  alert("Todo deleted successfully!");
  if (todos.length > 0) {
    todoList.previousElementSibling.classList.add("hidden");
  } else {
    todoList.previousElementSibling.classList.remove("hidden");
  }
  editTodoDialog.close();
}

async function editTodo(event) {
  event.preventDefault();
  const editValue = event.target["edited-todo-name"].value;
  const editDate = event.target["edited-todo-date"].value;
  const editId = +event.target.dataset.editId;

  todos = todos.map((todo) => {
    if (todo.todoID === editId) {
      return { ...todo, todoName: editValue, createdAt: new Date(editDate) };
    }
    return todo;
  });

  saveTodos(todos);
  renderTodo(todos);
  alert("Todo edited successfully!");
  editTodoDialog.close();
}

function saveTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function sortTodosByDate() {
  todos.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  renderTodo(todos);
}

function deleteSelectedTodos() {
  const selectedTodos = Array.from(
    document.querySelectorAll("#todo-list input[type='checkbox']:checked")
  ).map((checkbox) => +checkbox.id);

  const todosToDelete = todos.filter((todo) =>
    selectedTodos.includes(todo.todoID)
  );

  if (todosToDelete.length > 0) {
    const confirmDelete = confirm(
      "Are you sure you want to delete the selected todos?"
    );
    if (!confirmDelete) return;

    todos = todos.filter((todo) => !selectedTodos.includes(todo.todoID));
    saveTodos(todos);
    renderTodo(todos);
    alert("Selected todos deleted successfully!");
  } else {
    alert("No todos selected.");
  }

  if (todos.length > 0) {
    todoList.previousElementSibling.classList.add("hidden");
  } else {
    todoList.previousElementSibling.classList.remove("hidden");
  }
}
