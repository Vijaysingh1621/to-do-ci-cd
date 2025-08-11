import React, { useState, useEffect, useRef } from "react";
import "./App.css";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  dueDate?: string;
  createdAt: Date;
  notes?: string;
}

type FilterType = "all" | "active" | "completed";
type SortType = "created" | "priority" | "dueDate" | "alphabetical";

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("created");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
      }));
      setTodos(parsedTodos);
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Focus input when form is shown
  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddForm]);

  const categories = Array.from(
    new Set(todos.map((todo) => todo.category).filter(Boolean))
  );

  const addTodo = () => {
    if (input.trim() === "") return;

    const newTodo: Todo = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
      priority,
      category: selectedCategory || newCategory,
      dueDate: dueDate || undefined,
      createdAt: new Date(),
      notes: notes || undefined,
    };

    setTodos([newTodo, ...todos]);
    resetForm();
  };

  const resetForm = () => {
    setInput("");
    setSelectedCategory("");
    setNewCategory("");
    setPriority("medium");
    setDueDate("");
    setNotes("");
    setShowAddForm(false);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingTodo(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: number) => {
    if (editText.trim() === "") return;
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: editText.trim() } : todo
      )
    );
    setEditingTodo(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditText("");
  };

  const updatePriority = (
    id: number,
    newPriority: "low" | "medium" | "high"
  ) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, priority: newPriority } : todo
      )
    );
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const markAllComplete = () => {
    setTodos(todos.map((todo) => ({ ...todo, completed: true })));
  };

  const handleDragStart = (id: number) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const draggedIndex = todos.findIndex((todo) => todo.id === draggedItem);
    const targetIndex = todos.findIndex((todo) => todo.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTodos = [...todos];
    const draggedTodo = newTodos[draggedIndex];
    newTodos.splice(draggedIndex, 1);
    newTodos.splice(targetIndex, 0, draggedTodo);

    setTodos(newTodos);
    setDraggedItem(null);
  };

  const filteredAndSortedTodos = todos
    .filter((todo) => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    })
    .filter(
      (todo) =>
        todo.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (todo.notes &&
          todo.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter((todo) => !selectedCategory || todo.category === selectedCategory)
    .sort((a, b) => {
      switch (sort) {
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "alphabetical":
          return a.text.localeCompare(b.text);
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
    overdue: todos.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
    ).length,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            ✨ Amazing Todo App
          </h1>
          <p className="text-gray-600">
            Organize your life with style and efficiency
          </p>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Quick Stats</h2>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-purple-600 hover:text-purple-800 transition-colors"
            >
              {showStats ? "Hide" : "Show"} Details
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-blue-800">Total Tasks</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-sm text-green-800">Completed</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.active}
              </div>
              <div className="text-sm text-orange-800">Active</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.overdue}
              </div>
              <div className="text-sm text-red-800">Overdue</div>
            </div>
          </div>

          {showStats && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                Completion Rate:{" "}
                {stats.total > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0}
                %
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats.total > 0
                        ? (stats.completed / stats.total) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ➕ Add New Task
            </button>

            {todos.some((t) => t.completed) && (
              <button
                onClick={clearCompleted}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                🗑️ Clear Completed
              </button>
            )}

            {todos.some((t) => !t.completed) && (
              <button
                onClick={markAllComplete}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                ✅ Mark All Complete
              </button>
            )}
          </div>

          {/* Filters and Search */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Tasks</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="created">Date Created</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Create New Task
            </h3>

            <div className="space-y-4">
              <div>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  onKeyPress={(e) => e.key === "Enter" && addTodo()}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "low" | "medium" | "high")
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Or create new category..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes (optional)"
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addTodo}
                  disabled={!input.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✨ Create Task
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Todo List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Tasks ({filteredAndSortedTodos.length})
          </h3>

          {filteredAndSortedTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No tasks found</p>
              <p className="text-gray-400">
                Create your first task to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedTodos.map((todo) => (
                <div
                  key={todo.id}
                  draggable
                  onDragStart={() => handleDragStart(todo.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, todo.id)}
                  className={`group p-4 rounded-lg border-2 transition-all duration-300 cursor-move hover:shadow-md ${
                    todo.completed
                      ? "bg-gray-50 border-gray-200 opacity-75"
                      : isOverdue(todo.dueDate)
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-gray-200 hover:border-purple-300"
                  } ${
                    draggedItem === todo.id
                      ? "opacity-50 transform rotate-2"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />

                    <div className="flex-1 min-w-0">
                      {editingTodo === todo.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") saveEdit(todo.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(todo.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <h4
                              className={`font-medium ${
                                todo.completed
                                  ? "line-through text-gray-500"
                                  : "text-gray-900"
                              }`}
                            >
                              {todo.text}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                todo.priority
                              )}`}
                            >
                              {todo.priority}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            {todo.category && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                📂 {todo.category}
                              </span>
                            )}

                            {todo.dueDate && (
                              <span
                                className={`px-2 py-1 rounded-full ${
                                  isOverdue(todo.dueDate) && !todo.completed
                                    ? "bg-red-100 text-red-800"
                                    : "bg-orange-100 text-orange-800"
                                }`}
                              >
                                📅 {new Date(todo.dueDate).toLocaleDateString()}
                              </span>
                            )}

                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              ⏰ {todo.createdAt.toLocaleDateString()}
                            </span>
                          </div>

                          {todo.notes && (
                            <p className="mt-2 text-sm text-gray-600 italic">
                              💭 {todo.notes}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <select
                        value={todo.priority}
                        onChange={(e) =>
                          updatePriority(
                            todo.id,
                            e.target.value as "low" | "medium" | "high"
                          )
                        }
                        className="text-xs border border-gray-300 rounded px-1 py-1"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Med</option>
                        <option value="high">High</option>
                      </select>

                      <button
                        onClick={() => startEdit(todo)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
