const listElement = document.getElementById("ticket-list");
const addServerElem = document.getElementById("add-server");
const form = document.getElementById("creation-form");

async function createHash(str) {
	const encoder = new TextEncoder();
	const data = encoder.encode(str);
	const hash = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hash));
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
	return hashHex;
}

async function displayServers() {
	result = await browser.storage.sync.get(["servers"])
	if (result.servers && result.servers.length) {
		result.servers.forEach((server) => {
			appendItem(server, false);
		})
	} else {
		appendItem("No servers yet");
	}
}

async function appendItem(url, empty = true) {
	const liElem = document.createElement("li");
	liElem.id = "li" + await createHash(url);
	liElem.className = "list-group-item d-flex justify-content-between align-items-center";
	liElem.append(document.createTextNode(url));

	if (!empty) {
		const deleteButtomElem = document.createElement("button");
		deleteButtomElem.className = "btn btn-danger";
		deleteButtomElem.setAttribute("type", "button");
		deleteButtomElem.innerHTML = "&#9747;";
		deleteButtomElem.onclick = async function () {
			const liElemId = "li" + await createHash(url)
			const liElem = document.getElementById(liElemId);

			liElem.remove();

			const result = await browser.storage.sync.get(["servers"]);
			if (result.servers && result.servers.length) {
				const index = result.servers.indexOf(url);

				if (index !== -1) {
					result.servers.splice(index, 1);
				}
			}

			if (result.servers.length < 1) {
				appendItem("No servers yet")
			}

			await browser.storage.sync.set({ servers: result.servers });
		}

		const ticketForm = await createTicketForm(url);

		const buttonElem = document.createElement("button");
		buttonElem.className = "btn btn-secondary";
		buttonElem.setAttribute("type", "button");
		buttonElem.innerHTML = "&#9755;";
		buttonElem.onclick = async function () {
            if (ticketForm.classList.contains("d-none")) {
                ticketForm.classList.remove("d-none");
            } else {
                ticketForm.classList.add("d-none");
            }
		}

		liElem.append(deleteButtomElem);
		liElem.append(buttonElem);
		liElem.append(ticketForm);
	}
	listElement.append(liElem);
}

async function createTicketForm(url) {
	const ticketForm = document.createElement("form");
    ticketForm.className = "d-none";

	const ticketIdInput = document.createElement("input");
	ticketIdInput.id = await createHash(url);
	ticketIdInput.type = "text";
	ticketIdInput.name = "ticket-id";
	ticketForm.append(ticketIdInput);

	ticketForm.onsubmit = async function (e) {
		const hashValue = await createHash(url);
		const ticketValue = document.getElementById(hashValue).value;
		window.open(url + "/browse/" + ticketValue, "_blank");
        window.close(); // closes the popup
	}

	return ticketForm;
}

addServerElem.onclick = function () {
    if (form.classList.contains("d-none")) {
	    form.classList.remove("d-none");
    } else {
        form.classList.add("d-none");
    }
}

form.onsubmit = async function () {
	const urlElem = document.getElementById("url");
	const serverURL = urlElem.value.trim();

	result = await browser.storage.sync.get(["servers"])

	var servers = result.servers;

	if (!servers) {
		servers = [];
	}

	servers.push(serverURL);

	await browser.storage.sync.set({ servers: servers })

	urlElem.value = "";

	await appendItem(serverURL, false);

	return false;
};

displayServers();
