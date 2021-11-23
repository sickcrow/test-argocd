import React, { useState } from 'react';
import { ReactSVG } from 'react-svg'
import doublearrowup from '../assets/doublearrowup.svg'

export function ThemeInput(props) {
    const [ idFocus, setIdFocus ] = useState('')
    const { hintText, labelText, type, value, readonly, onChange, autoComplete, style, callbackFocus } = props
    const idInput = labelText.replace(/ /g, '-').toLowerCase()
 
    const inputFocus = async (e) => {
        await setIdFocus(e.target.id)
    }
    const focusOut = async (e, callbackFocus) => {
        if(idFocus === e.target.id) {
            
            if (callbackFocus) {
                var usuarioPropiedades = [
                    {nombre: "email", id: 9},
                    {nombre:"teléfono", id: 6},
                    {nombre:"nombre", id: 12},
                    {nombre:"apellido", id: 13},
                    {nombre:"n°-de-vendedor", id: 8},
                    {nombre:"n°-de-línea", id:10},
                    {nombre:"nombre-del-paquete", id:11},
                    {nombre:"n°-de-la-distribuidora", id:14},
                    {nombre:"n°-de-vendedor-según-resumen-de-cuenta",id:8}
                ]
               
                var inputId = e.target.id
                function buscarValor(elemento){
                    return elemento.nombre === inputId
                }
                var datos = {}
                var usuarioPropiedadId = usuarioPropiedades.find(buscarValor)
                const valorEmail = document.getElementById("email").value
                const nombreDistribuidoraId = document.getElementById("distribuidoraId").value

                        if(usuarioPropiedadId) {
                            datos = {
                                email: valorEmail,
                                propiedadValor: usuarioPropiedadId.id,
                                valor: e.target.value,

                            }  
                            
                        }
                        if(inputId === "nueva-contraseña"){
                            datos = {
                                email: valorEmail,
                                propiedadValor: 7,
                                valor: nombreDistribuidoraId,
                            }  
                           
                        }
                        callbackFocus(datos)
            }
            await setIdFocus('')
        }
    }
    return(
        <div className="theme-input" style={style}>
            <input type={type || "text"} id={idInput} className={ idFocus === idInput ? 'theme-input-box input-focus' : 'theme-input-box'} placeholder={hintText} onFocus={inputFocus} onBlur={(e) => focusOut(e,callbackFocus)} value={value} readOnly={readonly} autoComplete={autoComplete || 'off'} onChange={event => {onChange(event)}} />
        </div>
    )
}

export function ThemeButton(props) {
    const { onClick, labelText, style } = props

    return(
        <div className="div-button" style={style} >
            <button className=" theme-button" onClick={onClick}>
             {labelText || 'Submit'}
            </button>
        </div>
    )
}

export function ThemeTopBar(props) {
    const { title } = props

    return(
        <div className="theme-bar background-themecolor">
            <h1 className="theme-title">{title || 'Título'}</h1>
        </div>
        )
}

export function ArrowUp(props) {    
    const [showScroll, setShowScroll] = useState(false)

    const checkScrollTop = () => {
        if (!showScroll && window.scrollY !== 0){
            setShowScroll(true)
        } else if (showScroll && window.scrollY === 0){
            setShowScroll(false)
        }
    };
    
    window.addEventListener('scroll', checkScrollTop)

    const scrollTop = () =>{
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const botonEnviarExiste = document.getElementById('boton-enviar')

    const { style } = props
    return(
        <div id="arrow-up" className={"scrollTop " + (!showScroll ? 'd-none' : '')} onClick={() => {scrollTop()}} style={{...style, bottom: (botonEnviarExiste ? '120px' : '60px'), right: '20px', cursor: 'pointer'}} >
            <ReactSVG className="arrow-up" src={doublearrowup} />
        </div>
    )
}