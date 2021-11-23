import React from 'react';
import filter from '../assets/filter.svg'
import { ReactSVG } from 'react-svg'

export function Title(props) {
    const { title, style, classes, alterAccordion, accordion, classTitle } = props
    const idTitle = title.replace(/ /g, '-').toLowerCase()

    
    return(
            <div className={classes ? "d-flex justify-content-between header " + classes : "d-flex justify-content-between header"} id={idTitle} style={style? style : {}} >
                <div className={classTitle?classTitle:"title"}>
                    {title}
                </div>
                {alterAccordion ?
                <div className="d-flex align-items-center filterdiv" style={accordion? {color: '#224372'} : {}} onClick={() => alterAccordion() } >
                    {accordion? "CERRAR" : "FILTROS"}
                    <ReactSVG src={filter} className="filtericon" />
                </div> :
                null
                }
            </div>
    )
}