import Backend from './Backend.js';

export default class ContactManager {
	constructor() {
		this.backend = new Backend("http://localhost:3000/api/contacts");

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
		this.newContactForm.addEventListener('click', event => {
			if (event.target.matches('#save')) {
				event.preventDefault();
				this.backend.newContact();
				(event.target.parentNode).style.display = 'none';
			}
			this.renderContacts();
		});
		
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
					this.backend.deleteContact(event);
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
				this.backend.selectedTag();
			}
		})
	}

	async renderContacts() {
		let contacts = await this.backend.fetchContacts();
		let displayTemplate = Handlebars.compile($('#displayContacts').html());
		let $allContacts = $('#contacts');

		$allContacts.html(displayTemplate({ items: contacts }));
	}

	async renderSearchTags() {
		let tag = await this.backend.fetchTags();

		let tagSearchTemplate = Handlebars.compile($('#tagsSearchTemplate').html());
		let $allTags = $('#all-tags');

		$allTags.html(tagSearchTemplate({ tags: tag }))
	}


	async renderNewContact() {
		let tag = await this.backend.fetchTags();
		let newContactTemplate = Handlebars.compile($('#newContactTemplate').html());
		let $newContactForm = $('#add-contact-form');
		(this.newContactForm).style.display = 'block';

		$newContactForm.html(newContactTemplate({ tags: tag }));
	}

	async renderUpdatedContact(id) {
		let tag = await this.backend.fetchTags();
		let contact = await this.backend.fetchUpdated(id);

		let editContactTemplate = Handlebars.compile($('#editContactTemplate').html());
		let $editContactForm = $('#edit-contact-form');

		$editContactForm.html(editContactTemplate({ contacts: contact, tags: tag }));
	}

	async searchByName(value) {
		let contacts = await this.backend.fetchContacts();
		let filtered = contacts.filter(contact => contact.full_name.toLowerCase().includes(value.toLowerCase()));
		let $filterContact = $('#contacts');
		let displayTemplate = Handlebars.compile($('#displayContacts').html());
		$filterContact.html(displayTemplate({ items: filtered, searchValue: value }));
	}

	async searchByTag(tag) {
		let contacts = await this.backend.fetchContacts();
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

	processEdit(id, name) {
		document.addEventListener('submit', event => {
			let proceed = confirm(`Are you sure to update "${name}"?`)
			let $editContactForm = $('#edit-contact-form');

			if (proceed) {
				this.backend.updatedContact(id);
				$editContactForm.hide();
			}
			this.renderContacts();
		});
	}

}

document.addEventListener('DOMContentLoaded', () => {
	let contactManager = new ContactManager();
})