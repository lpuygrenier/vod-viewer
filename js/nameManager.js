class NameManager {
  constructor() {
    this.names = [];
    this.nameInputs = document.getElementById('nameInputs');
    this.addNameBtn = document.getElementById('addName');
    this.setupEventListeners();
    this.loadNames();
  }

  setupEventListeners() {
    this.addNameBtn.addEventListener('click', () => this.addNameField());
  }

  loadNames() {
    const storedNames = localStorage.getItem('names');
    if (storedNames) {
      this.names = JSON.parse(storedNames);
      this.names.forEach(name => this.addNameField(name));
    } else {
      this.addNameField(); // Add one empty field if no stored names
    }
  }

  addNameField(name = '') {
    const div = document.createElement('div');
    div.classList.add('input-container');
    const index = this.names.length;
    div.innerHTML = `
        <fieldset role="group">
          <input type="text" placeholder="Enter name" value="${name}" oninput="nameManager.updateName(${index}, this.value)">
          <button onclick="nameManager.removeName(${index})">Remove</button>
        </fieldset>
      `;
    this.nameInputs.appendChild(div);
    if (name && !this.names.includes(name)) {
      this.names.push(name);
      this.syncLocalStorage();
    }
  }

  updateName(index, value) {
    this.names[index] = value;
    this.syncLocalStorage();
  }

  removeName(index) {
    this.nameInputs.children[index].remove();
    this.names.splice(index, 1);
    this.syncLocalStorage();
    // Update oninput attributes for remaining inputs
    Array.from(this.nameInputs.children).forEach((child, i) => {
      child.querySelector('input').setAttribute('oninput', `nameManager.updateName(${i}, this.value)`);
      child.querySelector('.remove-btn').setAttribute('onclick', `nameManager.removeName(${i})`);
    });
  }

  syncLocalStorage() {
    localStorage.setItem('names', JSON.stringify(this.names));
  }

  tryFindPlayerName(filename) {
    for (const name of this.names) {
      if (filename.toLowerCase().includes(name.toLowerCase())) {
        return name;
      }
    }
    return filename;
  }

  getNames() {
    return this.names;
  }
}