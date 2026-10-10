
const loadUsersButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusMessage = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

const API_URL = "https://jsonplaceholder.typicode.com/users";

let users = [];

async function loadUsers() {
  loadUsersButton.disabled = true;
  statusMessage.textContent = "Loading users...";
  usersList.replaceChildren();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    users = await response.json();
    displayUsers();

    statusMessage.textContent = `Loaded ${users.length} users.`;
  } catch (error) {
    users = [];
    usersList.replaceChildren();
    statusMessage.textContent =
      "Unable to load users. Please check your connection and try again.";
    console.error("Error loading users:", error);
  } finally {
    loadUsersButton.disabled = false;
  }
}

function displayUsers() {
  const searchText = filterInput.value.trim().toLowerCase();

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchText)
  );

  usersList.replaceChildren();

  filteredUsers.forEach((user) => {
    const listItem = document.createElement("li");
    const name = document.createElement("h2");
    const email = document.createElement("p");
    const city = document.createElement("p");
    const company = document.createElement("p");

    name.textContent = user.name;
    email.textContent = `Email: ${user.email}`;
    city.textContent = `City: ${user.address.city}`;
    company.textContent = `Company: ${user.company.name}`;

    listItem.append(name, email, city, company);
    usersList.appendChild(listItem);
  });

  if (users.length > 0 && filteredUsers.length === 0) {
    statusMessage.textContent = "No users match your search.";
  } else if (users.length > 0) {
    statusMessage.textContent =
      `Showing ${filteredUsers.length} of ${users.length} users.`;
  }
}

loadUsersButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", displayUsers);
