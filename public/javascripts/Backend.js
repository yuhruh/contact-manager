export default class Backend {
	constructor(url) {
		this.url = url;
	}

	selectedTag() {
		let selected = [...document.getElementsByName('tag')].filter(el => el.checked)
		.map(el => el.getAttribute('id'));
		document.getElementById('tag').innerHTML = selected.join(',');
		return selected.join(',');
	}

	async fetchContacts() {
		return await fetch(this.url).then(data => data.json())
	}

	async newContact() {
		let data = JSON.stringify({	
			full_name: document.getElementById('full_name').value,
			email: document.getElementById('email').value,
      		phone_number: document.getElementById('phone_number').value,
      		tags: this.selectedTag()
      	})

      	let added = await fetch(`http://localhost:3000/api/contacts/`, {
      		method: 'POST',
      		headers: { 'Content-Type': 'application/json' },
      		body: data
      	})
      	return added;
	}

	async fetchTags() {
		let response = await fetch(this.url)
		let contacts = await response.json();
		let tagList = []
		let tags = contacts.filter(contact => contact.tags).map(contact => contact.tags.split(',')).flat();

		tags.forEach(tag => {
			if (tagList.indexOf(tag) === -1) {
				tagList.push(tag)
			}
		})

		return tagList;
	}

	async fetchUpdated(id) {
		return await fetch(`${this.url}/${id}`).then(data => data.json());
	}

	async updatedContact(id) {
		let name = document.getElementById('edit_full_name').value;
		let tagData = document.getElementById('tag').textContent || document.getElementById('edit_tags').value
	
		let data = JSON.stringify({
			full_name: document.getElementById('edit_full_name').value,
			email: document.getElementById('edit_email').value,
      		phone_number: document.getElementById('edit_phone_number').value,
      		tags: tagData
		})

		let updated = await fetch(`${this.url}/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: data,
		})

		if (updated.ok) {
			return (alert(`The contact "${name}" has been updated!`))
		} else {
			throw new Error ('Updated contact failed....')
		}
	}

	async deleteContact(event) {
		let id = event.target.closest('div').getAttribute('data-id');
		let name = event.target.closest('div').firstElementChild.textContent;

		let deleted = await fetch(`${this.url}/${id}`, {
			method: 'DELETE'
		})

		if (deleted.ok) {
			return (alert(`The contact "${name}" has been removed!`));
		} else {
			throw new Error ('Deleted contact falied....')
		}

	}
	
}