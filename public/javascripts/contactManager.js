// Features:
// show all contacts
// add contact:
//  validation on name, email, phone_number
//     name should be all letters (required)
//     phone_number should be 10 digits (required)
//     email: example@test.com (required)
//     tags: can be null
//           can be created by user if the tags list is not included the tag 
//     after submit the adding form, the form's value should restore the default value


// update/edit contact: 
//  validation on name, email, phone_number
//     name should be all letters (required)
//     phone_number should be 10 digits (required)
//     email: example@test.com (required)
//     tags: can be null
//           can be created by user if the tags is not included in the tag list


// delete contact

// search feature can be filter by name or name & tags or tags


class ContactManager {
	constructor() {
		this.addContactBtn = document.getElementById('add-contact-btn');
		this.newContactForm = document.getElementById('add-contact-form');
		this.editContactForm = document.getElementById('edit-contact-form');
		this.searchName = document.getElementById('search');
		this.searchTag = document.getElementById('all-tags');
		this.editDeleteBtn = document.getElementById('contacts');

		this.renderContacts();
		this.renderSearchTags();

		this.bindEvents();

	}

	bindEvents() {
		this.addContactBtn.addEventListener('click', this.renderNewContact.bind(this));
		this.newContactForm.addEventListener('submit', this.newContact.bind(this));
		
		this.newContactForm.addEventListener('click', event => {
			if (event.target.matches('#cancel')) {
				event.preventDefault();
				(event.target.parentNode).style.display = 'none';
			}
			this.renderContacts();
		})

		this.editContactForm.addEventListener('click', event => {
			if (event.target.matches('#cancel')) {
				event.preventDefault();
				(event.target.parentNode).style.display = 'none';
			}
			this.renderContacts();
		})

		this.editDeleteBtn.addEventListener('click', event => {
			let name = event.target.closest('div').firstElementChild.textContent;
			let id = event.target.closest('div').getAttribute('data-id');
			let $editContactForm = $('#edit-contact-form');

			if (event.target.matches('#delete-contact')) {
				let processed = confirm(`Are you sure to delete "${name}"? This action can not be recovered!!`)

				if(processed) {
					this.deleteContact(event);
					this.renderContacts();
					this.renderSearchTags();
				}
			} else if (event.target.matches('#edit-contact')) {
				this.renderUpdatedContact(id);
				$editContactForm.show();
				this.processEdit(id, name);
			}
		})

		this.searchName.addEventListener('change', event => {
			let searchValue = event.target.value;
			this.searchByName(searchValue);
			event.target.value = null;
		})

		this.searchTag.addEventListener('change', event => {
			let tag = event.target.value;
			this.searchByTag(tag);
		})

		document.addEventListener('click', event => {
			if (event.target.matches('#create')) {
				let tag = document.getElementById('create-new-tag').value;
				this.createNewTag(tag);
				document.getElementById('create-new-tag').value = null;
			} else if (event.target.matches('#choose')) {
				this.selectedTag();
			}
		})
	}

	async renderContacts() {
		let contacts = await this.fetchContacts();
		let displayTemplate = Handlebars.compile($('#displayContacts').html());
		let $allContacts = $('#contacts');

		$allContacts.html(displayTemplate({ items: contacts }));
	}

	async renderSearchTags() {
		let tag = await this.fetchTags();

		let tagSearchTemplate = Handlebars.compile($('#tagsSearchTemplate').html());
		let $allTags = $('#all-tags');

		$allTags.html(tagSearchTemplate({ tags: tag }))
	}


	async renderNewContact() {
		let tag = await this.fetchTags();
		let newContactTemplate = Handlebars.compile($('#newContactTemplate').html());
		let $newContactForm = $('#add-contact-form');
		(this.newContactForm).style.display = 'block';

		$newContactForm.html(newContactTemplate({ tags: tag }));
	}

	async renderUpdatedContact(id) {
		let tag = await this.fetchTags();
		let contact = await this.fetchUpdated(id);

		let editContactTemplate = Handlebars.compile($('#editContactTemplate').html());
		let $editContactForm = $('#edit-contact-form');

		$editContactForm.html(editContactTemplate({ contacts: contact, tags: tag }));
	}


	async fetchContacts() {
		try {
			let response = await fetch('http://localhost:3000/api/contacts');
			let contacts = await response.json();
	
			return contacts
		} catch (error) {
			console.error('Fetched contacts failed:', error);
		}
	}

	async fetchTags() {
		try {
			let response = await fetch('http://localhost:3000/api/contacts')
			let contacts = await response.json();
			let tagList = []
			let tags = contacts.filter(contact => contact.tags).map(contact => contact.tags.split(',')).flat();

			tags.forEach(tag => {
				if (tagList.indexOf(tag) === -1) {
					tagList.push(tag)
				}
			})

			return tagList;
		} catch (error) {
			console.error('Fetched contacts failed:', error);
		}
	}


	async newContact() {
		let data = JSON.stringify({	
			full_name: document.getElementById('full_name').value,
			email: document.getElementById('email').value,
      		phone_number: document.getElementById('phone_number').value,
      		tags: this.selectedTag()
      	})

      	try {
      		let added = await fetch(`http://localhost:3000/api/contacts/`, {
      			method: 'POST',
      			headers: { 'Content-Type': 'application/json' },
      			body: data
      		})

      	} catch (error) {
      		console.error('Add new contact failed:', error);
      	}
	}

	async deleteContact(event) {
		let id = event.target.closest('div').getAttribute('data-id');
		let name = event.target.closest('div').firstElementChild.textContent;
	
		try {
			let deleted = await fetch(`http://localhost:3000/api/contacts/${id}`, {
				method: 'DELETE'
			})

			if (deleted.ok) {
				return (alert(`The contact "${name}" has been removed!`));
			} else {
				throw new Error ('Deleted contact falied....')
			}

		} catch (error) {
			console.error('Delete failed:', error);
		}
	}

	async fetchUpdated(id) {
		try {
			let response = await fetch(`http://localhost:3000/api/contacts/${id}`);
			let contact = await response.json();

			return contact;
		} catch(error) {
			console.error('Fetched updated contact failed:', error);
		}
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

		try {
			let updated = await fetch(`http://localhost:3000/api/contacts/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: data,

			})

			if (updated.ok) {
				return (alert(`The contact "${name}" has been updated!`))
			} else {
				throw new Error ('Updated contact failed....')
			}

		} catch(error) {
			console.error('Contact update failed:', error);
		}

	}

	async searchByName(value) {
		let contacts = await this.fetchContacts();
		let filtered = contacts.filter(contact => contact.full_name.toLowerCase().includes(value.toLowerCase()));
		let $filterContact = $('#contacts');
		let displayTemplate = Handlebars.compile($('#displayContacts').html());
		$filterContact.html(displayTemplate({ items: filtered, searchValue: value }));
	}

	async searchByTag(tag) {
		let contacts = await this.fetchContacts();
		let regex = new RegExp(tag);

		let $filterContact = $('#contacts');
		let displayTemplate = Handlebars.compile($('#displayContacts').html());
		let filterTagContacts;

		if (tag === 'All' || tag === undefined) {
			filterTagContacts = contacts;
		} else {
			filterTagContacts = contacts.filter(contact => regex.test(contact.tags));
		}

		$filterContact.html(displayTemplate({ items: filterTagContacts }));
	}



	createNewTag(tag) {
		let newTag = tag.toLowerCase();
		let tagList = [...document.getElementsByName('tag')]

		let filterTagList;

		if (tagList.length === 0) {
			let labelNewTag = document.getElementById('check-tag');

			let newEle = this.createElementForNewTag(newTag);
			labelNewTag.insertAdjacentElement('afterend', newEle);
			filterTagList = [];
			filterTagList.push(newTag);
			return filterTagList;
		} else {
			filterTagList = tagList.filter(el => el.matches(`#${newTag}`));
			if (filterTagList.length === 0) {
				let newEle = this.createElementForNewTag(newTag);
				let adjacentEle = document.getElementById('checkbox');
				adjacentEle.insertAdjacentElement('beforebegin', newEle);
				filterTagList.push(newTag);
				return filterTagList;

			} else {
				alert(`The tag "${newTag}" has been on the list...`)
				return filterTagList;
			}
		}

	}

	createElementForNewTag(tag) {
		let dd = document.createElement('dd');
		let inputNewTag = document.createElement('input');
		let labelNewTag = document.createElement('label');
		dd.setAttribute('id', 'checkbox');
		inputNewTag.setAttribute('id', tag);
		inputNewTag.setAttribute('type', "checkbox");
		inputNewTag.setAttribute('name', "tag")
		labelNewTag.setAttribute('for', tag);
		labelNewTag.textContent = tag;
		dd.appendChild(inputNewTag);
		dd.appendChild(labelNewTag);
		return dd;
	}

	selectedTag() {
		let selected = [...document.getElementsByName('tag')].filter(el => el.checked)
		.map(el => el.getAttribute('id'));
		document.getElementById('tag').innerHTML = selected.join(',');
		return selected.join(',');
	}

	processEdit(id, name) {
		document.addEventListener('submit', event => {
			let proceed = confirm(`Are you sure to update "${name}"?`)
			let $editContactForm = $('#edit-contact-form');

			if (proceed) {
				this.updatedContact(id);
				$editContactForm.hide();
			}
			this.renderContacts();
		});
	}

}

document.addEventListener('DOMContentLoaded', () => {
	let contactManager = new ContactManager();
})