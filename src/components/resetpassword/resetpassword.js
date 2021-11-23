const confirmarEmail = document.getElementById('confirmarEmail')

if(confirmarEmail) {
    confirmarEmail.addEventListener('click', e => enviarEmail(e))
}

const enviarEmail = async e => {
    e.preventDefault()
    let email = document.getElementById('email') ? document.getElementById('email').value : null
    const data = {
        "email": email
    }
    if(validateReq(data)) {
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        const respuesta = await fetch(url + '/api/account/recuperarPassword', {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers
        })
        .then(async response => {
            if (parseInt(response.status) === 200) {
                return response.json()
            } else {
                let err = await response.json()
                err.status = response.status
                throw err
            }
        })
        .then(result => {
            console.log(result === data)
            Swal.fire({
                icon: 'success',
                title: "La petición se ha enviado con éxito.",
                showConfirmButton: false,
                timer: 1500
            })
            .then(res => {
                document.getElementById('email').value = ""
            })
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: error.message ? error.message : "Ha ocurrido un error.",
                showConfirmButton: false,
                timer: 1500
            })
            console.log('error', error)
        });
        return respuesta
    }
}

// Validador del usuario y contraseña
const validateReq = (data) => {
    let alertText = []
    let valid = true
    if (!data.email) {
        alertText = [
            ...alertText,
            'Debe ingresar una cuenta de email',
        ]
        valid = false
    } else {
        if (!(/.@[a-zÑñA-Z0-9]+([.-_]?[a-zÑñA-Z0-9]+)*(\.[a-zÑñA-Z0-9]{2,3})+$/.test(data.email))) {
            alertText = [
                ...alertText,
                'Debe ingresar una cuenta de email válida',
            ]
            valid = false
        }
    }
    if (!valid) {
        Swal.fire({
            icon: 'error',
            title: alertText[0],
        })
    }
    return valid
}