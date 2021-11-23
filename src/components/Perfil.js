import * as React from 'react';
import { 
    ThemeButton,
 } from './items'
import brandLogo from '../assets/brand-logo.png'
import Consumer from '../store/perfil'
import flechaPerfil from '../assets/flecha-perfil.svg'
import gps from '../assets/gps.svg'
import horario from '../assets/horario.svg'
import guardar from '../assets/guardar.svg'
import fotoPerfil from '../assets/perfil.svg'
import seleccionar from '../assets/seleccionar-reclamos.svg'
import telefono from '../assets/telefono.svg'
import urlServer from '../server'
import { ReactSVG } from 'react-svg';
import TimeInput from 'material-ui-time-picker'
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import Map from './Map'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Redirect } from 'react-router-dom';
import ReactGA from 'react-ga';

const MySwal = withReactContent(Swal)

export default class Perfil extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            datosPVbackup: {},
            datosPV: {},
            mapModal: false,
            modNombre: false,
            modTelefono: false,
            modContraseña: false,
            modUbicacion: false,
            modGPS: false,
            modHorario: false,
            modBooleanos: false,
            selectedOption: null,
            defaultSel: {
                localidad: null,
                departamento: null,
                provincia: null
            },
            camposAModificar: [],
            listaDepartamentos: [],
            listaLocalidades: [],
            listaProvincias: [],
            provinciaSelected: {value: null, label: 'Seleccione una provincia'},
            localidadSelected: null,
            departamentoSelected: {value: null, label: 'Seleccione un partido'},
            usuarioAModificar: {
                usuarioId:  JSON.parse(localStorage.infoToken).usuario_id
            },
            usuario: {},
            typechecked: "dia",
            diachecked: true,
            lavchecked: false,
            horarioAModificar: [],
            domicilioAModificar: [],
            errorProv: null,
            errorDpto: null,
            errorLocal: null,
            errorCalle: null,
            errorAltura: null,
            redirect: false,
            init: false,
        }
    }

    cargar= async() => {
         await this.listarProvincias()
         const { datosPV } = this.state
         await this.setState({
            provinciaSelected: this.state.listaProvincias.filter(e => e.value === (datosPV.domicilio && datosPV.domicilio.provinciaId))[0],
        })
        if(this.state.listaProvincias.length>0 && this.state.datosPV.domicilio) {
            await this.listarDepartamentos(this.state.datosPVbackup.domicilio.partidoDepartamentoDescripcion.toLowerCase())
            const departamentoSelected = this.state.listaDepartamentos.filter(e => e.label.toLowerCase() === this.state.datosPVbackup.domicilio.partidoDepartamentoDescripcion.toLowerCase())[0] || this.state.listaDepartamentos.filter(e => e.value === null)[0]
            await this.listarLocalidades(this.state.datosPVbackup.domicilio.localidadDescripcion.toLowerCase())
            const localidadSelected = this.state.listaLocalidades.filter(e => e.label.toLowerCase() === this.state.datosPVbackup.domicilio.localidadDescripcion.toLowerCase())[0] || this.state.listaLocalidades.filter(e => e.value === null)[0]
            this.setState({
                departamentoSelected: departamentoSelected,
                localidadSelected: localidadSelected,
            })
        }
    }
    enviarModificaciones = async (arr) => {
        const puntoVentaId = JSON.parse(localStorage.infoToken).entidad_id
        const usuarioIdUltimaModificacion = JSON.parse(localStorage.infoToken).usuario_id
        const data = {
            puntoVentaId,
            usuarioIdUltimaModificacion,
            valores: arr
        }
        if(data.valores.length > 0) {
            const headers = {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: 'Bearer ' + localStorage.token,
            }
            const respuesta = await fetch(urlServer + '/api/puntoVenta/modificar', {
              method: 'POST',
              redirect: 'manual',
              body: JSON.stringify(data),
              headers
            }).then(response => response.text())
            .catch(error => {console.log('error', error); })
            .then(result => {
              const res = JSON.parse(result)

              if(arr === this.state.domicilioAModificar) {
                  this.setState({
                      domicilioAModificar: []
                  })
              }
              MySwal.fire({
              icon: 'success',
              title: '¡Se han actualizado los datos con éxito!',
              showConfirmButton: false,
              timer: 1500
              })
              return res
            })
            .catch(error => {
              console.log('error', error); })
            return respuesta
        }
    }

    enviarUsuario = async (obj) => {
        const usuarioId = JSON.parse(localStorage.infoToken).usuario_id
        let data = {
            ...obj,
            usuarioId
        }

        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: 'Bearer ' + localStorage.token,
          }
          const respuesta = await fetch(urlServer + '/api/usuario/modificar', {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers
          }).then(response => response.text())
          .catch(error => {console.log('error', error); })
          .then(result => {
            const res = JSON.parse(result)
            this.setState({
                usuarioAModificar: {}
            })

            return res
          })
          .catch(error => {
            console.log('error', error); })
          return respuesta
    }

    separarPalabras = (arr) => {
        const palabras = Object.keys(arr)
        const booleanos = palabras.map((palabra, index) => {
            let boolean = {}
            boolean[palabra] = arr[palabra]
            boolean.item = palabra
            boolean.texto = palabra.slice(0, palabra.match(/[A-Z]/).index) + " " + palabra.slice(palabra.match(/[A-Z]/).index, palabra.length)
            boolean.texto = boolean.texto.toUpperCase()
            return boolean
        })
        const divs = booleanos.map((boolean, index) => {
            return  <React.Fragment key={index}>
                        <div className="d-flex   justify-content-between">
                            <div className="f-11 fw-500">
                                {boolean.texto} 
                            </div>
                            <div>
                                <div className="">
                                    <div className="custom-control custom-switch">
                                        <label className="switch">
                                        <input type="checkbox" id={"customSwitch" + index} defaultChecked={boolean[boolean.item] ? true : null} onClick={(e) => {
                                                const modificado = {
                                                    Campo: "reparto." + (boolean.item)[0].toUpperCase() + boolean.item.slice(1, boolean.item.length),
                                                    Valor: e.target.checked.toString()
                                                }

                                                if((boolean.item)[0].toUpperCase() + boolean.item.slice(1, boolean.item.length) === 'TieneReparto')
                                                {
                                                    ReactGA.event({
                                                        category: 'Perfil',
                                                        action: 'Punto de Venta Tiene Reparto'
                                                      });
                                                }

                                                if((boolean.item)[0].toUpperCase() + boolean.item.slice(1, boolean.item.length) === 'EntregaSuscripcion')
                                                {
                                                    ReactGA.event({
                                                        category: 'Perfil',
                                                        action: 'Punto de Venta Entrega Suscripcion'
                                                      });
                                                }

                                                if((boolean.item)[0].toUpperCase() + boolean.item.slice(1, boolean.item.length) === 'CargaDiario')
                                                {
                                                    ReactGA.event({
                                                        category: 'Perfil',
                                                        action: 'Punto de Venta Carga Diario'
                                                      });
                                                }

                                                if((boolean.item)[0].toUpperCase() + boolean.item.slice(1, boolean.item.length) === 'CargaRevista')
                                                {
                                                    ReactGA.event({
                                                        category: 'Perfil',
                                                        action: 'Punto de  Venta Carga Revista'
                                                      });
                                                }
                                                
                                                this.enviarModificaciones([modificado])
                                        }}/>
                                        <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr />
                    </React.Fragment>
        })
        return divs
    }

    letrasMayus = (nombre) => {
        let array = nombre.split("")
        let mayus = array.filter(e => e !== " " && e === e.toUpperCase())
        return mayus.slice(0,2).join("")
    }

    logOut = async () => {
        const apiUrl = urlServer + '/api/account/logout'
        let myHeaders = new Headers()
        myHeaders.append("Accept", "application/json")
        myHeaders.append("Authorization", "Bearer " + localStorage.token)
        await fetch(apiUrl, {
            method: 'POST',
            headers: myHeaders,
            redirect: 'manual'
        }).then(response => response.text())
        .catch(error => {
            console.log('error', error); 
        })
        .then(res => {
            //localStorage.clear()
            localStorage.removeItem('ddr-auth');
            localStorage.removeItem('ddr-token');
            localStorage.removeItem('is_authenticated');
            localStorage.removeItem('token');
            localStorage.removeItem('infoToken');
            localStorage.removeItem('refresh-token');
            localStorage.removeItem('expires_in');
            localStorage.removeItem('expires_at');
            localStorage.removeItem('result');


            this.setState({
                redirect: true,
            })
            this.props.setLanding([])
            this.props.loggingOut()
        })
        .catch(error => {
            console.log('error', error); 
        })
    }

    ObtenerDomicilio = async () => {
        const data = {
            "puntoVentaId": JSON.parse(localStorage.infoToken).entidad_id,
        }
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: 'Bearer ' + localStorage.token,
        }
        const respuesta = await fetch(urlServer + '/api/puntoVenta/buscar', {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers
        }).then(response => response.json())
        .catch(error => {
            console.log('error', error); 
        })
        .then(async result => {

            let datosPV = result
            if(datosPV.domicilio) {
                if((!datosPV.domicilio.x) || (!datosPV.domicilio.y)) {
                    console.log('buscando lat y long..')
                    const coord = await this.getAddress(datosPV.domicilio)
                    datosPV.domicilio.x = coord.lat
                    datosPV.domicilio.y = coord.lon
                }
            }
            let datosPVbackup = JSON.parse(JSON.stringify(datosPV))
            await this.setState({
                datosPVbackup,
                datosPV,
            })
            return result
        })
        .catch(error => {
            console.log('error', error); 
        })
        return respuesta
    }

    agregarDias = () => {
        let horarios = this.state.datosPV.horarios ? this.state.datosPV.horarios : []
        let domingo = []
        let dias = []
        if ((!horarios) || (!horarios[0])) {
            for(let index = 1; index < 8; index++) {
                horarios[index-1] = {
                    diaSemana: index,
                    horaInicio: null,
                    horaFin: null,
                }
            }
        }
        for (let index = 0; index < horarios.length; index++) {
            const element = horarios[index];
            let dia = ""
            let diaCompleto = ""
            switch (element.diaSemana) {
                case 2:
                    dia = "Lu"
                    diaCompleto = "Lunes"
                    break;
                case 3:
                    dia = "Mar"
                    diaCompleto = "Martes"
                    break;
                case 4:
                    dia = "Mié"
                    diaCompleto = "Miercoles"
                    break;
                case 5:
                    dia = "Jue"
                    diaCompleto = "Jueves"
                    break;
                case 6:
                    dia = "Vie"
                    diaCompleto = "Viernes"
                    break;
                case 7:
                    dia = "Sáb"
                    diaCompleto = "Sabado"
                    break;
                case 1:
                    dia = "Dom"
                    diaCompleto = "Domingo"
                    break;
            
                default:
                    break;
            }
            element.dia = dia
            element.diaCompleto = diaCompleto
            if(element.diaSemana !== 1) {
                dias = [
                    ...dias,
                    element
                ]
            } else {
                domingo = element
            }
        }
        dias = [
            ...dias,
            domingo
        ]
        let { datosPV } = this.state
        datosPV = {
            ...datosPV,
            horarios: dias
        }
        let datosPVbackup = JSON.parse(JSON.stringify(datosPV))
        this.setState({
            datosPV,
            datosPVbackup,
        })
    }

    renderHorario = () => {
        const horarios = this.state.datosPV.horarios ? this.state.datosPV.horarios : null
        const render = horarios ? horarios.map((dia, index) => {
            return (
                <div key={index} className="d-flex w-100 px-2 justify-content-between">
                    <div className="fw-500">
                        {dia.dia}
                    </div>
                    <div className="d-flex justify-content-between">
                        <div>
                        {dia.horaInicio ? dia.horaInicio.slice(0,5) : "--:--"}
                        </div>
                        <div>
                            -
                        </div>
                        <div>
                            {dia.horaFin ? dia.horaFin.slice(0,5) : "--:--"} 
                        </div>
                    </div>
                </div>
            )
        }) : null
        return render
    }

    renderInputs = () => {
        const { horarios } = this.state.datosPV.horarios ? this.state.datosPV : null
        const render = horarios ? horarios.map((dia, index) => {
            let horaInicio = dia.horaInicio? dia.horaInicio.split(":") : null
            let horaFin = dia.horaFin? dia.horaFin.split(":") : null

            if (horaInicio) {
                horaInicio = (+(parseInt(horaInicio[0]) + 3) * (60000 * 60)) + (+horaInicio[1] * 60000) + (+horaInicio[2] * 1000)
            }

            if (horaFin) {
                horaFin = (+(parseInt(horaFin[0]) + 3) * (60000 * 60)) + (+horaFin[1] * 60000) + (+horaFin[2] * 1000)
            }
            return (
                <div key={index} className="  pr-0 justify-content-between">
                    <div className="fw-500">
                        {dia.dia}
                    </div>
                    <div className="d-flex time-inputs" style={this.state.typechecked === "lav" && index > 0 && index < 5 ? {pointerEvents: 'none', backgroundColor: '#E5E5E5   '} : {}} >
                        <TimeInput 
                            mode='24h'
                            value={new Date(horaInicio ? horaInicio : (3600000 * 3))}
                            className="dias-time-input"
                            cancelLabel={"Cancelar"}
                            onChange={(time) => {
                              //  const { datosPVbackup } = this.state
                                const stringInicio = ("0" + time.getHours().toString()).slice(-2) + ":" + ("0" + time.getMinutes().toString()).slice(-2) + ":00"
                                dia.horaInicio = stringInicio
                                let dias = horarios
                                let { horarioAModificar } = this.state
                                let index = dias.findIndex(e => e.diaSemana === dia.diaSemana)
                                if (this.state.typechecked === "lav" && index < 5){
                                    let i = 0
                                    while (i < 5) {
                                        dias[i].horaInicio = dia.horaInicio
                                        let modificado = {
                                            Campo: "horario." + dias[i].diaCompleto + ".HoraInicio",
                                            Valor: stringInicio    
                                        } 
                                        if(horarioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                                            horarioAModificar[horarioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = stringInicio
                                        } else {
                                            horarioAModificar = [
                                                ...horarioAModificar,
                                                modificado
                                            ]
                                        }
                                        i++
                                    }
                                } else {
                                    dias[index] = dia
                                    let modificado = {
                                        Campo: "horario." + dia.diaCompleto + ".HoraInicio",
                                        Valor: stringInicio    
                                    } 
                                    if(horarioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                                        horarioAModificar[horarioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = stringInicio
                                    } else {
                                        horarioAModificar = [
                                            ...horarioAModificar,
                                            modificado
                                        ]
                                    }
                                }
                                console.log(horarioAModificar)
                                this.setState({
                                    datosPV: {
                                        ...this.state.datosPV,
                                        horarios: dias
                                    },
                                    horarioAModificar
                                })
                            }}
                        />
                        <div style={{lineHeight: '25px', marginRight: '3px'}}>
                            -
                        </div>
                        <TimeInput 
                            mode='24h'
                            value={new Date(horaFin ? horaFin : (3600000 * 3))}
                            className="dias-time-input"
                            cancelLabel={"Cancelar"}
                            onChange={(time) => {
                                //const { datosPVbackup } = this.state
                                const stringFin = ("0" + time.getHours().toString()).slice(-2) + ":" + ("0" + time.getMinutes().toString()).slice(-2) + ":00"
                                dia.horaFin = stringFin
                                let dias = horarios
                                let index = dias.findIndex(e => e.diaSemana === dia.diaSemana)
                                let { horarioAModificar } = this.state
                                if (this.state.typechecked === "lav" && index < 5){
                                    let i = 0
                                    while (i < 5) {
                                        dias[i].horaFin = dia.horaFin
                                        let modificado = {
                                            Campo: "horario." + dias[i].diaCompleto + ".HoraFin",
                                            Valor: stringFin    
                                        }
                                        if(horarioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                                            horarioAModificar[horarioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = stringFin
                                        } else {
                                            horarioAModificar = [
                                                ...horarioAModificar,
                                                modificado
                                            ]
                                        }
                                        i++
                                    }
                                } else {
                                    dias[index] = dia
                                    let modificado = {
                                        Campo: "horario." + dia.diaCompleto + ".HoraFin",
                                        Valor: stringFin  
                                    }
                                    if(horarioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                                        horarioAModificar[horarioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = stringFin
                                    } else {
                                        horarioAModificar = [
                                            ...horarioAModificar,
                                            modificado
                                        ]
                                    }
                                }
                                this.setState({
                                    datosPV: {
                                        ...this.state.datosPV,
                                        horarios: dias
                                    },
                                    horarioAModificar
                                })
                            }}
                        />
                    </div>
                </div>
            )
        }) : null
        return render
    }

    listarProvincias = async () => {
        const data = {
            PalabraABuscar: ""
        }
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: 'Bearer ' + localStorage.token,
        }
        const respuesta = await fetch(urlServer + '/api/domicilio/provincia/listar', {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers
        }).then(response => response.json())
        .catch(error => {
            console.log('error', error); 
        })
        .then(result => {
            let options = result.map(prov => {
                const value = {
                    value: prov.provinciaId,
                    label: prov.descripcion
                }
                return value
            })
            options = [
              {value: null, label: 'Seleccione una provincia'},
              ...options
            ]
            this.setState({
                listaProvincias: options
            })
            return options
        })
        .catch(error => {
            console.log('error', error); 
        })
        return respuesta
    }

    listarDepartamentos = async (palabra) => {
        const data = {
            PalabraABuscar: palabra,
            ProvinciaId: this.state.provinciaSelected ? this.state.provinciaSelected.value : null
        }
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: 'Bearer ' + localStorage.token,
        }
        const respuesta = await fetch(urlServer + '/api/domicilio/departamento/listar', {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers
        }).then(response => response.json())
        .catch(error => {
            console.log('error', error); 
        })
        .then(async result => {
            let options = result.map(dpto => {
                const value = {
                    value: dpto.partidoDepartamentoId,
                    label: dpto.descripcion
                }
                return value
            })
            options = [
              {value: null, label: 'Seleccione un partido'},
              ...options
            ]
            const departamento = options.filter(e => e.label === (this.state.datosPV.domicilio && this.state.datosPV.domicilio.partidoDepartamentoDescripcion))[0]
            await this.setState({
                defaultSel: {
                    ...this.state.defaultSel,
                    departamento
                }
            })
            this.setState({
                listaDepartamentos: options
            })
            return options
        })
        .catch(error => {
            console.log('error', error); 
        })
        return respuesta
    }

    listarLocalidades = async (palabra) => {
        const data = {
            PalabraABuscar: palabra,
            ProvinciaId: this.state.provinciaSelected ? this.state.provinciaSelected.value : null,
            PartidoDepartamentoId: this.state.departamentoSelected ? this.state.departamentoSelected.value : null
        }
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: 'Bearer ' + localStorage.token,
        }
        const respuesta = await fetch(urlServer + '/api/domicilio/localidad/listar', {
            method: 'POST',
            redirect: 'manual',
            body: JSON.stringify(data),
            headers
        }).then(response => response.json())
        .catch(error => {
            console.log('error', error); 
        })
        .then(async  result => {
            let options = result.map(loc => {
                const value = {
                    value: loc.localidadId,
                    label: loc.descripcion
                }
                return value
            })
            options = [
              {value: null, label: 'Seleccione una Localidad'},
              ...options
            ]
            const localidad = options.filter(e => e.label === (this.state.datosPV.domicilio && this.state.datosPV.domicilio.localidadDescripcion))[0]
            await this.setState({
                defaultSel: {
                    ...this.state.defaultSel,
                    localidad
                }
            })
            this.setState({
                listaLocalidades: options
            })
            return options
        })
        .catch(error => {
            console.log('error', error); 
        })
        return respuesta
    }

    handleProvinciaChange = async (selected) => {
        const campo = "domicilio.ProvinciaId"
        let modificado = selected.value && (selected.value !== (this.state.datosPVbackup.domicilio && this.state.datosPVbackup.domicilio.provinciaId))? {
            Campo: campo,
            Valor: selected.value
        } : null
        await this.setState({
          provinciaSelected: null,
          departamentoSelected: null,
        })
        let { datosPV } = this.state
        datosPV.domicilio.localidadDescripcion = ""
        datosPV.domicilio.partidoDepartamentoDescripcion = ""
        await this.setState({
            datosPV
        })
        this.setState({
          provinciaSelected: selected,
          departamentoSelected: this.state.listaDepartamentos.filter(e => e.value = "null")[0],
        })
        let { domicilioAModificar } = this.state
        if (modificado) {
            if(domicilioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                domicilioAModificar[domicilioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = modificado.Valor
            } else {
                domicilioAModificar = [
                    ...domicilioAModificar,
                    modificado
                ]
            }
            this.setState({
                domicilioAModificar
            })
        } else {
            if(domicilioAModificar.filter(e => e.Campo === campo).length !== 0) {
                domicilioAModificar = domicilioAModificar.filter(e => e.Campo !== campo)
            }
            this.setState({
                domicilioAModificar
            })
        }
        if(domicilioAModificar.filter(e => e.Campo === "domicilio.DepartamentoId").length !== 0) {
            domicilioAModificar[domicilioAModificar.findIndex(e => e.Campo === "domicilio.DepartamentoId")].Valor = null
        } else {
            domicilioAModificar = [
                ...domicilioAModificar,
                {Campo: "domicilio.DepartamentoId", Valor: null}
            ]
        }
        if(domicilioAModificar.filter(e => e.Campo === "domicilio.LocalidadId").length !== 0) {
            domicilioAModificar[domicilioAModificar.findIndex(e => e.Campo === "domicilio.LocalidadId")].Valor = null
        } else {
            domicilioAModificar = [
                ...domicilioAModificar,
                {Campo: "domicilio.LocalidadId", Valor: null}
            ]
        }
    }

    handleDepartamentoChange = async (selected) => {
        const campo = "domicilio.DepartamentoId"
        let modificado = selected.value && (selected.value !== (this.state.datosPVbackup.domicilio && this.state.datosPVbackup.domicilio.partidoDepartamentoId))? {
            Campo: campo,
            Valor: selected.value
        } : null
        await this.setState({
          departamentoSelected: null,
        })
        this.setState({
          departamentoSelected: selected,
        })
        let { domicilioAModificar } = this.state
        if (modificado) {
            if(domicilioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                domicilioAModificar[domicilioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = modificado.Valor
            } else {
                domicilioAModificar = [
                    ...domicilioAModificar,
                    modificado,
                ]
            }
            this.setState({
                domicilioAModificar
            })
        } else {
            if(domicilioAModificar.filter(e => e.Campo === campo).length !== 0) {
                domicilioAModificar = domicilioAModificar.filter(e => e.Campo !== campo)
            }
            this.setState({
                domicilioAModificar
            })
        }
        if(domicilioAModificar.filter(e => e.Campo === "domicilio.LocalidadId").length !== 0) {
            domicilioAModificar[domicilioAModificar.findIndex(e => e.Campo === "domicilio.LocalidadId")].Valor = null
        } else {
            domicilioAModificar = [
                ...domicilioAModificar,
                {Campo: "domicilio.LocalidadId", Valor: null}
            ]
        }
        let { datosPV } = this.state
        datosPV.domicilio.localidadDescripcion = ""
        this.setState({
            datosPV
        })
    }

    handleLocalidadChange = (selected) => {
        const campo = "domicilio.LocalidadId"
        let modificado = selected.value && (selected.value !== (this.state.datosPVbackup.domicilio && this.state.datosPVbackup.domicilio.localidadId))? {
            Campo: campo,
            Valor: selected.value
        } : null
        this.setState({
          localidadSelected: selected,
        })
        let { domicilioAModificar } = this.state
        if (modificado) {
            if(domicilioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                domicilioAModificar[domicilioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = modificado.Valor
            } else {
                domicilioAModificar = [
                    ...domicilioAModificar,
                    modificado
                ]
            }
            this.setState({
                domicilioAModificar
            })
        } else {
            if(domicilioAModificar.filter(e => e.Campo === campo).length !== 0) {
                domicilioAModificar = domicilioAModificar.filter(e => e.Campo !== campo)
            }
            this.setState({
                domicilioAModificar
            })
        }
    }

    getAddress = async (domicilio) => {
        let data
        let urlArr = [
            (domicilio.localidadDescripcion? "&county=" + domicilio.localidadDescripcion : ""),
            (domicilio.provinciaDescripcion? "&state=" + domicilio.provinciaDescripcion : ""),
            (domicilio.calle? "&street=" + domicilio.numero + " " + domicilio.calle : ""),
            (domicilio.partidoDepartamentoDescripcion? "&city=" + domicilio.partidoDepartamentoDescripcion : ""),
        ]
        let i = 0
        while (!data) {
            let params = ""
            let index = i
            for(i = index; i < urlArr.length; i++) {
                params += urlArr[i]
            }
            i = index + 1
            const url = ("https://nominatim.openstreetmap.org/search?format=json&country=Argentina" + params).replace(" ", "%20")
            const response = await fetch(url).then(res => res.json())
            data = await response[0]
            if ((i >= urlArr.length) && (!data)) {
                break
            }
        }
        return data
    }

    validarDireccion() {
        const calle = document.getElementById('calle')
        const altura = document.getElementById('altura')
        const errorCalle = calle.value ? false : true
        const errorAltura = altura.value ? false: true
        const errorProv = this.state.provinciaSelected && this.state.provinciaSelected.value !== "null" && this.state.provinciaSelected.value !== null ? false : true
        const errorDpto = this.state.departamentoSelected && this.state.departamentoSelected.value !== "null" && this.state.departamentoSelected.value !== null ? false : true
        const errorLocal = this.state.localidadSelected && this.state.localidadSelected.value !== "null" && this.state.localidadSelected.value !== null ? false : true
        calle.style.border = !calle.value ? "1px solid red" : ""
        altura.style.border = !altura.value ? "1px solid red" : "" 
        this.setState({
            errorProv,
            errorDpto,
            errorLocal,
            errorCalle,
            errorAltura
        })
    }

    componentDidMount = async () => {
        await this.ObtenerDomicilio()
        this.props.setStateEstaEnPerfil()
        //const { datosPV } = this.state
         await this.setState({
             mapModal: true,
         })
        
         this.agregarDias()

        ReactGA.event({
            category: 'Perfil',
            action: 'Mostrar Perfil'
          });
    }

    render(){
        const { datosPV, modUbicacion, modHorario, modNombre, modTelefono, modGPS, usuario, mapModal, errorProv, errorDpto, errorLocal, errorCalle, errorAltura, redirect } = this.state
        return  <Consumer>
                    {perfil => (
                    <div style={{overflowY: "scroll", maxHeight: "calc(100vh - 44px)"}}>
                        <div className="container text-left" style={{marginBottom: '30px'}}>
                            <div className="position-relative text-center">
                                <img className="brand-logo" src={brandLogo} alt="brand-logo" onClick={() => {
                                    this.props.setStateNoEstaEnPerfil()
                                    this.props.hidePerfil()
                                }} ></img>
                                <ThemeButton
                                    class="position-absolute"
                                    onClick={() => {
                                        this.logOut()
                                    }}
                                    labelText={"Cerrar Sesión"}
                                    style={{position: 'absolute', right: '0'}}
                                /> 
                            </div>
                            <div className="perfil-pic mx-auto text-center">
                                {perfil.img ? <img className="pic" src={perfil.img} alt="Tu Perfil" /> : 
                                <div className="pic">
                                    <img className="pic" src={fotoPerfil} alt="Tu Perfil" /> 
                                </div>}
                            </div>
                            {redirect? 
                            <Redirect push to={{
                                pathname: '/'
                            }} />
                            : null}
                            <div className="perfil-nya mb-2 d-flex justify-content-between align-items-center  ">
                                {modNombre ? 
                                <div className="d-flex">
                                    <input type="text" className="form-control f-12" placeholder="Nombre" defaultValue={usuario.nombre? usuario.nombre : (perfil.nombre ? perfil.nombre : "")} style={{width: '47%', marginRight: "10px"}} onChange={(e) => {
                                        this.setState({
                                            usuarioAModificar: {
                                                ...this.state.usuarioAModificar,
                                                nombre: e.target.value
                                            },
                                            usuario: {
                                                ...this.state.usuario,
                                                nombre: e.target.value
                                            }
                                        })
                                    }} />
                                    <input type="text" className="form-control f-12" placeholder="Apellido" defaultValue={usuario.apellido? usuario.apellido : (perfil.apellido ? perfil.apellido : "")} style={{width: '47%'}} onChange={(e) => {
                                        this.setState({
                                            usuarioAModificar: {
                                                ...this.state.usuarioAModificar,
                                                apellido: e.target.value
                                            },
                                            usuario: {
                                                ...this.state.usuario,
                                                apellido: e.target.value
                                            }
                                        })
                                    }} />
                                </div>
                                : 
                                <div>{usuario.nombre? usuario.nombre : (perfil.nombre ? perfil.nombre : "")}  {usuario.apellido? usuario.apellido : (perfil.apellido ? perfil.apellido : "")}</div>
                                }
                                {modNombre ? 
                                <span style={{cursor: 'pointer'}} onClick={() => {
                                    this.setState({
                                        modNombre: !this.state.modNombre,
                                    })

                                    ReactGA.event({
                                        category: 'Perfil',
                                        action: 'Editar Nombre y Apellido de Usuario'
                                      });

                                    if(this.state.usuarioAModificar && (this.state.usuarioAModificar.nombre || this.state.usuarioAModificar.apellido)) {
                                        const { nombre, apellido } = this.state.usuarioAModificar

                                        this.enviarUsuario({nombre, apellido})
                                    }
                                }}>
                                    <ReactSVG className="seleccionar" src={guardar} style={{margin: '3px', width: '23px', height: '23px', color: '#224372', background: '#C7E6F9', borderRadius: '50%'}} />
                                </span>
                                :<span style={{cursor: 'pointer'}} onClick={() => {
                                    this.setState({
                                        modNombre: !this.state.modNombre,
                                    })
                                }}>
                                    <ReactSVG className="seleccionar" src={seleccionar} style={{margin: '3px', width: '23px', height: '23px', color: '#224372', background: '#C7E6F9', borderRadius: '50%'}} />
                                </span>}
                            </div>
                            <div className="mb-2   d-flex justify-content-between align-items-center" style={{}}>
                                {modTelefono ? 
                                <div className="d-flex">
                                    <input type="text" className="form-control f-12" placeholder="Teléfono" defaultValue={usuario.telefono? usuario.telefono : (perfil.telefono ? perfil.telefono : "")} style={{width: '97%', marginRight: "10px"}} onChange={(e) => {
                                        this.setState({
                                            usuarioAModificar: {
                                                ...this.state.usuarioAModificar,
                                                telefono: e.target.value
                                            },
                                            usuario: {
                                                ...this.state.usuario,
                                                telefono: e.target.value
                                            }
                                        })
                                    }} />
                                </div>
                                : 
                                <div>{usuario.telefono? usuario.telefono : (perfil.telefono ? perfil.telefono : "")} </div>
                                }
                                {modTelefono ? 
                                <span style={{cursor: 'pointer'}} onClick={() => {
                                    this.setState({
                                        modTelefono: !this.state.modTelefono,
                                    })

                                    ReactGA.event({
                                        category: 'Perfil',
                                        action: 'Editar Telefono de Usuario'
                                      });

                                    if(this.state.usuario && this.state.usuario.telefono) {
                                        const { telefono } = this.state.usuario
                                        this.enviarUsuario({ telefono })
                                    }
                                }}>
                                    <ReactSVG className="seleccionar" src={guardar} style={{margin: '3px', width: '23px', height: '23px', color: '#224372', background: '#C7E6F9', borderRadius: '50%'}} />
                                </span>
                                :<span style={{cursor: 'pointer'}} onClick={() => {
                                    this.setState({
                                        modTelefono: !this.state.modTelefono,
                                    })
                                }}>
                                    <ReactSVG className="seleccionar" src={telefono} style={{margin: '3px', width: '23px', height: '23px', color: '#224372', background: '#C7E6F9', borderRadius: '50%'}} />
                                </span>}
                            </div>
                        </div>
                        <div className="pvkiosco">
                            <div className="d-flex justify-content-center container" style={{marginBottom: "25px"}}>
                                <div className="pvkiosco-title">
                                    <ReactSVG src={flechaPerfil} className="flecha-perfil" />
                                    Punto de venta
                                </div>
                            </div>
                            <div style={{paddingBottom: "56px"}}>
                                <div className="ubicacion-perfil container">
                                    <div className="d-flex   justify-content-between align-items-center pr-0" style={{marginBottom: '14px'}}>
                                        <div className="d-flex gps-perfil">
                                            <ReactSVG src={gps} className="gps-svg"/>
                                            Ubicación
                                        </div>
                                        {modUbicacion ?<div className="btn btn-enviar" onClick={async () => {
                                            await this.validarDireccion()
                                            const { errorCalle, errorAltura, errorProv, errorDpto, errorLocal } = this.state
                                            if(errorCalle || errorAltura || errorProv || errorDpto || errorLocal) {
                                                MySwal.fire({
                                                icon: 'error',
                                                title: 'Faltan datos por completar',
                                                showConfirmButton: false,
                                                timer: 1500
                                                })
                                            } else {
                                                this.setState({
                                                    modUbicacion: !this.state.modUbicacion,
                                                    modGPS: false
                                                })
                                                const { datosPVbackup } = this.state
                                                if((datosPV.domicilio.x !== (datosPVbackup.domicilio && datosPVbackup.domicilio.x)) || (datosPV.domicilio.y !== (datosPVbackup.domicilio && datosPVbackup.domicilio.y))) {
                                                    const data = [
                                                        {Campo: "domicilio.X", Valor: parseFloat(datosPV.domicilio.x)},
                                                        {Campo: "domicilio.Y", Valor: parseFloat(datosPV.domicilio.y)},
                                                    ]
                                                    this.enviarModificaciones(data)
                                                }

                                                ReactGA.event({
                                                    category: 'Perfil',
                                                    action: 'Editar Ubicación de Punto de Venta'
                                                  });

                                                this.enviarModificaciones(this.state.domicilioAModificar)
                                            }
                                        }}>
                                            Guardar
                                        </div>
                                        :<div className="btn btn-enviar" onClick={async () => {
                                            await this.cargar()
                                            this.setState({
                                                modUbicacion: !this.state.modUbicacion,
                                                modGPS: true,
                                            })
                                        }}>
                                            Editar
                                        </div>
                                        }
                                    </div>
                                    {mapModal? <Map 
                                        validarDireccion={e => this.validarDireccion(e)}
                                        setGPS={async arr => {
                                            if(this.state.modGPS) {
                                                let { datosPV } = this.state
                                                datosPV = {
                                                    ...datosPV,
                                                    domicilio: {
                                                        ...datosPV.domicilio,
                                                        x: arr[0],
                                                        y: arr[1]
                                                    }
                                                }
                                                await this.setState({
                                                    datosPV
                                                })
                                                return true
                                            } else {
                                                return false
                                            }
                                        }}
                                        modGPS={modGPS}
                                        obtenerUbicacion={async (data) => {
                                            if(modGPS) {
                                                const { datosPV } = this.state
                                                if(datosPV.domicilio.calle !== data.road) {
                                                    let campo = "domicilio.Calle"
                                                    let modificado = data.road && (data.road !== (this.state.datosPVbackup.domicilio && this.state.datosPVbackup.domicilio.calle)) ? {
                                                        Campo: campo,
                                                        Valor:data.road
                                                    } : null
                                                    let { domicilioAModificar } = this.state
                                                    if (modificado) {
                                                        if(domicilioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                                                            domicilioAModificar[domicilioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = modificado.Valor
                                                        } else {
                                                            domicilioAModificar = [
                                                                ...domicilioAModificar,
                                                                modificado
                                                            ]
                                                        }
                                                        this.setState({
                                                            domicilioAModificar
                                                        })
                                                    } else {
                                                        if(domicilioAModificar.filter(e => e.Campo === campo).length !== 0) {
                                                            domicilioAModificar = domicilioAModificar.filter(e => e.Campo !== campo)
                                                        }
                                                        this.setState({
                                                            domicilioAModificar
                                                        })
                                                    }
                                                }
                                                if(datosPV.domicilio.numero !== data.house_number) {
                                                    let campo = "domicilio.Numero"
                                                    let modificado = data.house_number && (data.house_number !== (this.state.datosPVbackup.domicilio && this.state.datosPVbackup.domicilio.numero)) ? {
                                                        Campo: campo,
                                                        Valor: data.house_number
                                                    } : null
                                                    let { domicilioAModificar } = this.state
                                                    if (modificado) {
                                                        if(domicilioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                                                            domicilioAModificar[domicilioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = modificado.Valor
                                                        } else {
                                                            domicilioAModificar = [
                                                                ...domicilioAModificar,
                                                                modificado
                                                            ]
                                                        }
                                                        this.setState({
                                                            domicilioAModificar
                                                        })
                                                    } else {
                                                        if(domicilioAModificar.filter(e => e.Campo === campo).length !== 0) {
                                                            domicilioAModificar = domicilioAModificar.filter(e => e.Campo !== campo)
                                                        }
                                                        this.setState({
                                                            domicilioAModificar
                                                        })
                                                    }
                                                }
                                                datosPV.domicilio.calle = data.road ? data.road : null
                                                datosPV.domicilio.numero = data.house_number ? data.house_number : null
                                                const calle = document.getElementById('calle')
                                                const altura = document.getElementById('altura')
                                                calle.value = data.road ? data.road : null
                                                altura.value = data.house_number ? data.house_number : null
                                                const { listaProvincias, listaDepartamentos, listaLocalidades } = this.state
                                                const provinciaSelected = listaProvincias.filter(e => e.label.toLowerCase() === ((data.state_district.indexOf('omuna') === -1) && ((data.state_district.indexOf('ciudad') !== -1) && (data.state_district.indexOf('buenos aires') !== -1) ? false : true) ? data.city.toLowerCase() : "capital federal").toLowerCase())[0] || listaProvincias.filter(e => e.value === null)[0] || listaProvincias.filter(e => e.value === "null")[0]
                                                let departamentoSelected
                                                if(provinciaSelected !== this.state.provinciaSelected) {
                                                    await this.handleProvinciaChange(provinciaSelected)
                                                }
                                                await this.listarDepartamentos((data.state_district.indexOf('omuna') === -1) && ((data.state_district.indexOf('ciudad') !== -1) && (data.state_district.indexOf('buenos aires') !== -1) ? false : true) ? data.state_district.toLowerCase() : "capital federal")
                                                departamentoSelected = this.state.listaDepartamentos.filter(e => e.label.toLowerCase() === ((data.state_district.indexOf('omuna') === -1) && ((data.state_district.indexOf('ciudad') !== -1) && (data.state_district.indexOf('buenos aires') !== -1) ? false : true) ? data.state_district.toLowerCase() : "capital federal").toLowerCase())[0] || listaDepartamentos.filter(e => e.value === null)[0] || listaDepartamentos.filter(e => e.value === "null")[0]
                                                await this.handleDepartamentoChange(departamentoSelected)
                                                await this.listarLocalidades((data.municipality && data.municipality.toLowerCase()) || (data.subutb && data.suburb.toLowerCase()))
                                                const localidadSelected = this.state.listaLocalidades.filter(e => e.label.toLowerCase() === (data.municipality || "").toLowerCase() || e.label.toLowerCase() === (data.neighbourhood || "").toLowerCase() || e.label.toLowerCase() === (data.suburb || "").toLowerCase())[0] || listaLocalidades.filter(e => e.value === null)[0]
                                                await this.handleLocalidadChange(localidadSelected)
                                                return true
                                            } else {
                                                return false
                                            }
                                        }}
                                        x={this.state.datosPV.domicilio ? this.state.datosPV.domicilio.x : -35}
                                        y={this.state.datosPV.domicilio ? this.state.datosPV.domicilio.y : -65}
                                    />: null}
                                    {modUbicacion ? null: 
                                    <div className="mt-3 f-13-5">
                                        {datosPV.domicilio ? (datosPV.domicilio.calle + " " + datosPV.domicilio.numero) : null}
                                    </div>}
                                    {modUbicacion ?
                                    <React.Fragment>
                                    <div className="d-flex mt-3" style={{marginBottom: '14px'}}>
                                        <div className="col-8 pl-0">
                                            <span style={errorCalle? {color: "red"}:{}}>
                                                Calle
                                            </span>
                                            <input id="calle" type="text" className="form-control" placeholder="Calle" defaultValue={datosPV.domicilio && datosPV.domicilio.calle} aria-label="Recipient's username" aria-describedby="basic-addon2" onChange={(e) => {
                                                let campo = "domicilio.Calle"
                                                let modificado = e.target.value && (e.target.value !== (this.state.datosPVbackup.domicilio && this.state.datosPVbackup.domicilio.calle)) ? {
                                                    Campo: campo,
                                                    Valor: e.target.value
                                                } : null
                                                let { domicilioAModificar } = this.state
                                                if (modificado) {
                                                    if(domicilioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                                                        domicilioAModificar[domicilioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = modificado.Valor
                                                    } else {
                                                        domicilioAModificar = [
                                                            ...domicilioAModificar,
                                                            modificado
                                                        ]
                                                    }
                                                    this.setState({
                                                        domicilioAModificar
                                                    })
                                                } else {
                                                    if(domicilioAModificar.filter(e => e.Campo === campo).length !== 0) {
                                                        domicilioAModificar = domicilioAModificar.filter(e => e.Campo !== campo)
                                                    }
                                                    this.setState({
                                                        domicilioAModificar
                                                    })
                                                }
                                                let { datosPV } = this.state
                                                datosPV = {
                                                    ...datosPV,
                                                    domicilio: {
                                                        ...datosPV.domicilio,
                                                        calle: e.target.value
                                                    }
                                                }
                                                this.setState({
                                                    datosPV
                                                })
                                            }}></input>
                                        </div>
                                        <div className="col-4 pl-0">
                                            <span style={errorAltura? {color: "red"}:{}}>
                                                Altura
                                            </span>
                                            <input id="altura" type="text" className="form-control" placeholder="Altura" defaultValue={datosPV.domicilio && datosPV.domicilio.numero} aria-label="Recipient's username" aria-describedby="basic-addon2" onChange={(e) => {
                                                let campo = "domicilio.Numero"
                                                let modificado = e.target.value && (e.target.value !== (this.state.datosPVbackup.domicilio && this.state.datosPVbackup.domicilio.numero)) ? {
                                                    Campo: campo,
                                                    Valor: e.target.value
                                                } : null
                                                let { domicilioAModificar } = this.state
                                                if (modificado) {
                                                    if(domicilioAModificar.filter(e => e.Campo === modificado.Campo).length !== 0) {
                                                        domicilioAModificar[domicilioAModificar.findIndex(e => e.Campo === modificado.Campo)].Valor = modificado.Valor
                                                    } else {
                                                        domicilioAModificar = [
                                                            ...domicilioAModificar,
                                                            modificado
                                                        ]
                                                    }
                                                    this.setState({
                                                        domicilioAModificar
                                                    })
                                                } else {
                                                    if(domicilioAModificar.filter(e => e.Campo === campo).length !== 0) {
                                                        domicilioAModificar = domicilioAModificar.filter(e => e.Campo !== campo)
                                                    }
                                                    this.setState({
                                                        domicilioAModificar
                                                    })
                                                }
                                                let { datosPV } = this.state
                                                datosPV = {
                                                    ...datosPV,
                                                    domicilio: {
                                                        ...datosPV.domicilio,
                                                        numero: e.target.value
                                                    }
                                                }
                                                this.setState({
                                                    datosPV
                                                })
                                            }}></input>
                                        </div>
                                    </div>
                                    <div className="d-flex" style={{marginBottom: '14px'}}>
                                        <div className="col-6 pl-0">
                                            <span style={errorProv? {color: "red"}:{}}>
                                                Provincia
                                            </span>
                                            <Select
                                            value={this.state.provinciaSelected}
                                            placeholder={'Provincia'}
                                            onChange={this.handleProvinciaChange}
                                            options={this.state.listaProvincias}
                                            className={errorProv? "alert-red" : ""}
                                            />
                                        </div>
                                        <div className="col-6 pl-0">
                                            <span style={errorDpto? {color: "red"}:{}}>
                                                Partido
                                            </span>
                                            <AsyncSelect
                                            key={ this.state.provinciaSelected && this.state.provinciaSelected.value ? this.state.provinciaSelected.value : 0}
                                            cacheOptions
                                            defaultValue={this.state.defaultSel.departamento}
                                            value={this.state.departamentoSelected}
                                            loadOptions={this.listarDepartamentos}
                                            placeholder={'Partido'}
                                            defaultOptions
                                            isDisabled={this.state.provinciaSelected && this.state.provinciaSelected.value !== null && this.state.provinciaSelected.value !== "null" ? false : true}
                                            onChange={this.handleDepartamentoChange}
                                            className={errorDpto? "alert-red" : ""}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex" style={{marginBottom: '14px'}}>
                                            <div className="col-6 pl-0">
                                                <span style={errorLocal? {color: "red"}:{}}>
                                                    Localidad
                                                </span>
                                                <AsyncSelect 
                                                key={ this.state.departamentoSelected && this.state.departamentoSelected.value ? this.state.departamentoSelected.value : 0}
                                                cacheOptions
                                                defaultValue={this.state.defaultSel.localidad}
                                                loadOptions={this.listarLocalidades}
                                                value={this.state.localidadSelected}
                                                placeholder={'Localidad'}
                                                defaultOptions
                                                isDisabled={this.state.departamentoSelected && this.state.departamentoSelected.value !== null && this.state.departamentoSelected.value !== "null" ? false : true}
                                                onChange={this.handleLocalidadChange}
                                                className={errorLocal? "alert-red" : ""}
                                                />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                    : 
                                    null}
                                </div>
                                <hr />
                                <div className="horarios-perfil container">
                                    <div className="d-flex   justify-content-between align-items-center pr-0" style={{marginBottom: '35px'}}>
                                        <div className="d-flex gps-perfil">
                                            <ReactSVG src={horario} className="gps-svg"/>
                                            Horario de Atención
                                        </div>
                                        {modHorario ?
                                        <div className="btn btn-enviar" onClick={() => {
                                            this.setState({
                                                modHorario: !this.state.modHorario
                                            })

                                            ReactGA.event({
                                                category: 'Perfil',
                                                action: 'Editar Horarios de Punto de Venta'
                                              });

                                            this.enviarModificaciones(this.state.horarioAModificar)
                                        }}>
                                            Guardar
                                        </div>
                                        :
                                        <div className="btn btn-enviar" onClick={() => {
                                            this.setState({
                                                modHorario: !this.state.modHorario
                                            })
                                        }}>
                                            Editar
                                        </div>
                                        }
                                    </div>
                                    {modHorario ?
                                    <React.Fragment>
                                    <div className="d-flex">
                                        
                                        <label className="container3" style={ {marginRight: "20px"}}>Día a día
                                            <input name={"typecheck"} type="checkbox" checked={this.state.typechecked === "dia" ? true : false } value="dia" onChange={(e) => {
                                                let a = document.getElementsByName("typecheck")
                                                for (let i = 0; i <= a.length; i++) {
                                                if (a[i]) {
                                                    a[i].checked = false 
                                                }
                                                }
                                                e.target.checked = true
                                                this.setState({
                                                    typechecked: "dia"
                                                })
                                            }} />
                                            <span className="checkmark3"></span>
                                        </label>
                                        <label className="container3">Repetir horario lunes a viernes
                                            <input name={"typecheck"} type="checkbox" checked={this.state.typechecked === "lav" ? true : false } value="lav" onChange={(e) => {
                                                console.log(e.target)
                                                let a = document.getElementsByName("typecheck")
                                                for (let i = 0; i <= a.length; i++) {
                                                if (a[i]) {
                                                    a[i].checked = false 
                                                }
                                                }
                                                e.target.checked = true
                                                this.setState({
                                                    typechecked: "lav"
                                                })
                                            }} />
                                            <span className="checkmark3"></span>
                                        </label>
                                    </div>
                                    <div style={{display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", justifyItems: "center"}}>
                                        {this.renderInputs()}
                                    </div>
                                    </React.Fragment>:
                                    <div style={{display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", justifyItems: "center"}}>
                                        {this.renderHorario()}
                                    </div>}
                                </div>
                                <div className="booleanos-perfil pt-4 container">
                                    {datosPV.reparto? this.separarPalabras(datosPV.reparto) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                </Consumer>
    }
}