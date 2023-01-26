import { GithubUser } from "./GithubUser.js";

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root);
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find((entry) => entry.login === username)
            
            if (userExists) {
                throw new Error('User already exists')
            }

            const user = await GithubUser.search(username)

            if (user.login === undefined) {
                throw new Error('User not found!')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()

        } catch (error) {
            alert(error.message)
        } 
    }   

    delete(user) {
        const filteredEntries = this.entries.filter(
            (entry) => entry.login !== user.login
        )

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root);

        this.tbody = this.root.querySelector('table .fav')

        this.update()
        this.onadd()
    }

    onadd() {
        const addBtn = this.root.querySelector('.search button')
        addBtn.onclick = () => {
            const { value } = this.root.querySelector('.search input')

            this.add(value)
        }
    }

    update() {
        this.removeTr()

        if(this.entries.length == 0) {
            this.tbody.append(this.noLine())
        }

        this.entries.forEach((user) => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Image from ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers


            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Are you sure you want to remove?')
                if (isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
        })
    }

    createRow () {
        const tr = document.createElement('tr');
    
        tr.innerHTML = `
            <td class="user">
                <img src="" alt="">
                <a href="" target="_blank">
                <p></p>
                <span></span>
                </a>
            </td>
            <td class="repositories"></td>
            <td class="followers"></td>
            <td class="action">
                <button class="remove">Remove</button>
            </td>
        `
        return tr
    }

    noLine() {
        const tr = document.createElement('tr')
        tr.classList.add('empty')

        tr.innerHTML = `
            <tr class="empty">
                <td>
                    <img src="./assets/Estrela.svg" alt="Star image">
                    <p>Favorites is empty</p>
                </td>
            </tr>
        `

        return tr
    }
    
    removeTr() {
        this.tbody.querySelectorAll('tr').forEach((tr) => {
            tr.remove()
        })
    }
}

