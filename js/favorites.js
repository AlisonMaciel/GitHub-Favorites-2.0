export class GitHubUsers {
    static search(userName) {
        const endpoint = `https://api.github.com/users/${userName}`

        return fetch(endpoint)
        .then(date => date.json())
        .then(({login, name, public_repos, followers }) => ({
            login: login,
            name: name,
            public_repos: public_repos,
            followers: followers
        }))
    }
}

export class Favorites { 
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }
    
    load() {
        this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
            
        }

    save() {
        localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
    }    
        
    async  add(username) {

        const userExist = this.entries.find(entry => entry.login === username)

        if(userExist)  {
        return  alert("Usuário já cadastrado") 
        } 
        
        try {
            const user = await GitHubUsers.search(username)

            if(user.login === undefined) {
                throw new Error("Usuario não encontrado")
            }
            
            this.entries = [user, ...this.entries] // é como se a gente falsse, pega a nova pessoa mas mantem a anterior tambem, usando esse metodo nao quebramos o principio da imutabilidade
            this.update()
            this.save()  

        } catch(error) {
            alert(error.message)
        }
    }

    delete(users) {
        const filteredEntries = this.entries.
        filter(entry => entry.login !== users.login)

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)
        
        this.tbody = this.root.querySelector("table tbody")
        
        this.update()
        this.onadd()
    }

    update() {
        this.removeAllTr()

        this.entries.forEach(users => {
            const row = this.createRow()
            
            row.querySelector(".users img").src = `https://github.com/${users.login}.png`
            row.querySelector(".users img ").alt = `Imagem ${users.name}`
            row.querySelector(".users a").href = `https://github.com/${users.login}`
            row.querySelector(".users a  p").textContent = users.name
            row.querySelector(".users a span").textContent = users.login
            row.querySelector(".repositories").textContent = users.public_repos
            row.querySelector(".followers").textContent = users.followers

            row.querySelector(".remove").onclick = () => {
                const isOk = confirm("Tem certeza que deseja remover esse usuário ?")
                if(isOk) {
                    this.delete(users)
                }
            }

            this.tbody.append(row)
        })
    }

    onadd() {
        const addbutton = this.root.querySelector(".search button")
        addbutton.onclick = () => {
            const {value} = this.root.querySelector(".search input")

            this.add(value)
        }
    }

    createRow() {
        const tr = document.createElement("tr")

        tr.innerHTML = `

        <td class="users">
                    <img src="https://github.com/AlisonMaciel.png" alt="Imagem Alison Maciel">
                    <a href="">
                        <p>Alison Betini</p>
                        <span>AlisonBetini</span>
                    </a>
        </td>
        <td class="repositories">
                    76
        </td>

        <td class="followers">
                    9589
        </td>

        <td><button class="remove">&times;</button></td>
           
        `
        return tr
        // ou tr.inerHTML = content
    }
    
    removeAllTr() {
        this.tbody.querySelectorAll("tr")
        .forEach((tr) => {
            tr.remove()
        })
    }
}