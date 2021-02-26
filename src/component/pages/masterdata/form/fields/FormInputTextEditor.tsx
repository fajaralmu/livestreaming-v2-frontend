

import React, { Component, Fragment, MouseEventHandler } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { mapCommonUserStateToProps } from '../../../../../constant/stores';
import EntityElement from '../../../../../models/settings/EntityElement';
import MasterDataService from '../../../../../services/MasterDataService';
import './TextEditor.css'
import BaseComponent from '../../../../BaseComponent';
import AnchorWithIcon from '../../../../navigation/AnchorWithIcon';
import BaseField from './BaseField';
class IState {
    editMode: boolean = false;
    fieldValue: string = "";
    updated: boolean = false;
}
class FormInputTextEditor extends BaseField {
    masterDataService: MasterDataService;
    state: IState = new IState();
    contentRef: React.RefObject<HTMLDivElement> = React.createRef();
    constructor(props: any) {
        super(props);
        this.masterDataService = this.getServices().masterDataService;
    } 
    formatDoc = (sCmd, sValue?) => {
        const oDoc = this.contentRef.current;
        if (!oDoc){
            console.debug("oDOc is missing");
            return;
        }
        console.debug("commmand: ", sCmd);
        if (this.validateMode()) { 
            const executed =  document.execCommand(sCmd, false, sValue); 
            console.debug("EXECUTED: ", executed, " editable: ", oDoc.contentEditable);
            oDoc.focus(); 
        }
    }

    validateMode = () => {
        if (!this.state.editMode) { return true; }
        alert("Uncheck \"Show HTML\".");
        if (this.contentRef.current) {
            this.contentRef.current.focus();
        }
        return false;
    }

    setValue = (e) => {
        if (this.contentRef.current) {
            this.setState({fieldValue: this.contentRef.current.innerHTML, updated: true})
        }
       
    }

    setDocMode = (bToSource) => {
        const oDoc = this.contentRef.current;
        if (!oDoc) return;
        var oContent;
        if (bToSource) {
            oContent = document.createTextNode(oDoc.innerHTML);
            oDoc.innerHTML = "";
            var oPre = document.createElement("pre");
            oDoc.contentEditable = "false";
            oPre.id = "sourceText";
            oPre.contentEditable = "true";
            oPre.appendChild(oContent);
            oDoc.appendChild(oPre);
        } else {
            if (document.all) {
                oDoc.innerHTML = oDoc.innerText;
            } else {
                oContent = document.createRange();
                oContent.selectNodeContents(oDoc.firstChild);
                oDoc.innerHTML = oContent.toString();
            }
            oDoc.contentEditable = "true";
        }
        oDoc.focus();
    }

    printDoc = () => {
        if (!this.validateMode()) { return; }
        // var oPrntWin = window.open("", "_blank", "width=450,height=470,left=400,top=100,menubar=yes,toolbar=no,location=no,scrollbars=yes");
        // oPrntWin.document.open();
        // oPrntWin.document.write("<!doctype html><html><head><title>Print<\/title><\/head><body onload=\"print();\">" + oDoc.innerHTML + "<\/body><\/html>");
        // oPrntWin.document.close();
    }

    prepopulateForm = () => {
        if (!this.props.recordToEdit || !this.contentRef.current) {
            return;

        }
        const fieldName = this.getEntityElement().id;
        let recordValue = this.props.recordToEdit[fieldName];
        if (!recordValue) return;
        this.contentRef.current.innerHTML = recordValue;
        this.setState({fieldValue: recordValue, updated: true});
    }
         
    componentDidUpdate(){
        console.debug("component updated");
    }

    setEditMode = (mode:boolean) => {
        this.setDocMode(mode);
        this.setState({ editMode: mode});
    }
    paleteCommand = (e:any ) => {
        const anchor:HTMLAnchorElement = e.target as HTMLAnchorElement;
        const commmand = anchor.dataset['command'];
        const value = anchor.dataset['value'];
        if (commmand == 'clean') {
            this.clean();
        } else {
            this.formatDoc(commmand, value);
        }
    }
    clean = () => {
        const app = this;
        this.showConfirmationDanger("Clean content?")
        .then(function(ok){
            if (ok) {
                if (app.contentRef.current) {
                    app.contentRef.current.innerHTML = "";
                }
            }
        })
    }
    contentOnChange = (e) => {
       this.setState({updated: false});
    } 
    render() {

        const element = this.getEntityElement();
        return (
            <div>
                <input type="hidden" value={this.state.fieldValue} name={element.id} />
                <div id="toolBar1" className="input-group">
                    <FormattingList onChange={this.formatDoc} />
                    <FontList onChange={this.formatDoc} />
                    <FontSizeOption onChange={this.formatDoc} />
                    <FontColorOption onChange={this.formatDoc} />
                    <BackgroundColorOption onChange={this.formatDoc} />
                </div>
                <div id="toolBar2">
                    <i  onMouseDown={(e)=>e.preventDefault()} onClick={this.paleteCommand} data-command="clean" className="palete fas fa-broom"></i>
                    {/* onClick="if(validateMode()&&confirm('Are you sure?')){oDoc.innerHTML=sDefTxt};" src="data:image/gif;base64,R0lGODlhFgAWAIQbAD04KTRLYzFRjlldZl9vj1dusY14WYODhpWIbbSVFY6O7IOXw5qbms+wUbCztca0ccS4kdDQjdTLtMrL1O3YitHa7OPcsd/f4PfvrvDv8Pv5xv///////////////////yH5BAEKAB8ALAAAAAAWABYAAAV84CeOZGmeaKqubMteyzK547QoBcFWTm/jgsHq4rhMLoxFIehQQSAWR+Z4IAyaJ0kEgtFoLIzLwRE4oCQWrxoTOTAIhMCZ0tVgMBQKZHAYyFEWEV14eQ8IflhnEHmFDQkAiSkQCI2PDC4QBg+OAJc0ewadNCOgo6anqKkoIQA7" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  className="palete fas fa-print "></i>
                    {/* onClick="printDoc();" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oEBxcZFmGboiwAAAAIdEVYdENvbW1lbnQA9syWvwAAAuFJREFUOMvtlUtsjFEUx//n3nn0YdpBh1abRpt4LFqtqkc3jRKkNEIsiIRIBBEhJJpKlIVo4m1RRMKKjQiRMJRUqUdKPT71qpIpiRKPaqdF55tv5vvusZjQTjOlseUkd3Xu/3dPzusC/22wtu2wRn+jG5So/OCDh8ycMJDflehMlkJkVK7KUYN+ufzA/RttH76zaVocDptRxzQtNi3mRWuPc+6cKtlXZ/sddP2uu9uXlmYXZ6Qm8v4Tz8lhF1H+zDQXt7S8oLMXtbF4e8QaFHjj3kbP2MzkktHpiTjp9VH6iHiA+whtAsX5brpwueMGdONdf/2A4M7ukDs1JW662+XkqTkeUoqjKtOjm2h53YFL15pSJ04Zc94wdtibr26fXlC2mzRvBccEbz2kiRFD414tKMlEZbVGT33+qCoHgha81SWYsew0r1uzfNylmtpx80pngQQ91LwVk2JGvGnfvZG6YcYRAT16GFtW5kKKfo1EQLtfh5Q2etT0BIWF+aitq4fDbk+ImYo1OxvGF03waFJQvBCkvDffRyEtxQiFFYgAZTHS0zwAGD7fG5TNnYNTp8/FzvGwJOfmgG7GOx0SAKKgQgDMgKBI0NJGMEImpGDk5+WACEwEd0ywblhGUZ4Hw5OdUekRBLT7DTgdEgxACsIznx8zpmWh7k4rkpJcuHDxCul6MDsmmBXDlWCH2+XozSgBnzsNCEE4euYV4pwCpsWYPW0UHDYBKSWu1NYjENDReqtKjwn2+zvtTc1vMSTB/mvev/WEYSlASsLimcOhOBJxw+N3aP/SjefNL5GePZmpu4kG7OPr1+tOfPyUu3BecWYKcwQcDFmwFKAUo90fhKDInBCAmvqnyMgqUEagQwCoHBDc1rjv9pIlD8IbVkz6qYViIBQGTJPx4k0XpIgEZoRN1Da0cij4VfR0ta3WvBXH/rjdCufv6R2zPgPH/e4pxSBCpeatqPrjNiso203/5s/zA171Mv8+w1LOAAAAAElFTkSuQmCC"> */}
                    <i  onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="undo" className="palete fas fa-undo"></i>
                    {/* onClick="formatDoc('undo');" src="data:image/gif;base64,R0lGODlhFgAWAOMKADljwliE33mOrpGjuYKl8aezxqPD+7/I19DV3NHa7P///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARR8MlJq7046807TkaYeJJBnES4EeUJvIGapWYAC0CsocQ7SDlWJkAkCA6ToMYWIARGQF3mRQVIEjkkSVLIbSfEwhdRIH4fh/DZMICe3/C4nBQBADs=" /> */}
                    <i  onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="redo"  className="palete fas fa-redo"></i>
                    {/* onClick="formatDoc('redo');" src="data:image/gif;base64,R0lGODlhFgAWAMIHAB1ChDljwl9vj1iE34Kl8aPD+7/I1////yH5BAEKAAcALAAAAAAWABYAAANKeLrc/jDKSesyphi7SiEgsVXZEATDICqBVJjpqWZt9NaEDNbQK1wCQsxlYnxMAImhyDoFAElJasRRvAZVRqqQXUy7Cgx4TC6bswkAOw==" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="removeFormat" className="palete fas fa-times"></i>
                    {/* onClick="formatDoc('removeFormat')" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABGdBTUEAALGPC/xhBQAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAAd0SU1FB9oECQMCKPI8CIIAAAAIdEVYdENvbW1lbnQA9syWvwAAAuhJREFUOMtjYBgFxAB501ZWBvVaL2nHnlmk6mXCJbF69zU+Hz/9fB5O1lx+bg45qhl8/fYr5it3XrP/YWTUvvvk3VeqGXz70TvbJy8+Wv39+2/Hz19/mGwjZzuTYjALuoBv9jImaXHeyD3H7kU8fPj2ICML8z92dlbtMzdeiG3fco7J08foH1kurkm3E9iw54YvKwuTuom+LPt/BgbWf3//sf37/1/c02cCG1lB8f//f95DZx74MTMzshhoSm6szrQ/a6Ir/Z2RkfEjBxuLYFpDiDi6Af///2ckaHBp7+7wmavP5n76+P2ClrLIYl8H9W36auJCbCxM4szMTJac7Kza////R3H1w2cfWAgafPbqs5g7D95++/P1B4+ECK8tAwMDw/1H7159+/7r7ZcvPz4fOHbzEwMDwx8GBgaGnNatfHZx8zqrJ+4VJBh5CQEGOySEua/v3n7hXmqI8WUGBgYGL3vVG7fuPK3i5GD9/fja7ZsMDAzMG/Ze52mZeSj4yu1XEq/ff7W5dvfVAS1lsXc4Db7z8C3r8p7Qjf///2dnZGxlqJuyr3rPqQd/Hhyu7oSpYWScylDQsd3kzvnH738wMDzj5GBN1VIWW4c3KDon7VOvm7S3paB9u5qsU5/x5KUnlY+eexQbkLNsErK61+++VnAJcfkyMTIwffj0QwZbJDKjcETs1Y8evyd48toz8y/ffzv//vPP4veffxpX77z6l5JewHPu8MqTDAwMDLzyrjb/mZm0JcT5Lj+89+Ybm6zz95oMh7s4XbygN3Sluq4Mj5K8iKMgP4f0////fv77//8nLy+7MCcXmyYDAwODS9jM9tcvPypd35pne3ljdjvj26+H2dhYpuENikgfvQeXNmSl3tqepxXsqhXPyc666s+fv1fMdKR3TK72zpix8nTc7bdfhfkEeVbC9KhbK/9iYWHiErbu6MWbY/7//8/4//9/pgOnH6jGVazvFDRtq2VgiBIZrUTIBgCk+ivHvuEKwAAAAABJRU5ErkJggg=="> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="bold" className="palete fas fa-bold"></i>
                    {/* onClick="formatDoc('bold');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAInhI+pa+H9mJy0LhdgtrxzDG5WGFVk6aXqyk6Y9kXvKKNuLbb6zgMFADs=" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="italic" className="palete fas fa-italic"></i>
                    {/* onClick="formatDoc('italic');" src="data:image/gif;base64,R0lGODlhFgAWAKEDAAAAAF9vj5WIbf///yH5BAEAAAMALAAAAAAWABYAAAIjnI+py+0Po5x0gXvruEKHrF2BB1YiCWgbMFIYpsbyTNd2UwAAOw==" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="underline" className="palete fas fa-underline"></i>
                    {/* onClick="formatDoc('underline');" src="data:image/gif;base64,R0lGODlhFgAWAKECAAAAAF9vj////////yH5BAEAAAIALAAAAAAWABYAAAIrlI+py+0Po5zUgAsEzvEeL4Ea15EiJJ5PSqJmuwKBEKgxVuXWtun+DwxCCgA7" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="justifyleft" className="palete fas fa-align-left"></i>
                    {/* onClick="formatDoc('justifyleft');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JMGELkGYxo+qzl4nKyXAAAOw==" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="justifycenter" className="palete fas fa-align-center"></i>
                    {/* onClick="formatDoc('justifycenter');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIfhI+py+0Po5y02ouz3jL4D4JOGI7kaZ5Bqn4sycVbAQA7" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="justifyright" className="palete fas fa-align-right"></i>
                    {/* onClick="formatDoc('justifyright');" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAIghI+py+0Po5y02ouz3jL4D4JQGDLkGYxouqzl43JyVgAAOw==" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="insertorderedlist" className="palete fas fa-list-ol"></i>
                    {/* onClick="formatDoc('insertorderedlist');" src="data:image/gif;base64,R0lGODlhFgAWAMIGAAAAADljwliE35GjuaezxtHa7P///////yH5BAEAAAcALAAAAAAWABYAAAM2eLrc/jDKSespwjoRFvggCBUBoTFBeq6QIAysQnRHaEOzyaZ07Lu9lUBnC0UGQU1K52s6n5oEADs=" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="insertonorderedlist" className="palete fas fa-list-ul"></i>
                    {/* onClick="formatDoc('insertunorderedlist');" src="data:image/gif;base64,R0lGODlhFgAWAMIGAAAAAB1ChF9vj1iE33mOrqezxv///////yH5BAEAAAcALAAAAAAWABYAAAMyeLrc/jDKSesppNhGRlBAKIZRERBbqm6YtnbfMY7lud64UwiuKnigGQliQuWOyKQykgAAOw==" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="formatblock" data-value="blockquote" className="palete fas fa-quote-left"></i>
                    {/* onClick="formatDoc('formatblock','blockquote');" src="data:image/gif;base64,R0lGODlhFgAWAIQXAC1NqjFRjkBgmT9nqUJnsk9xrFJ7u2R9qmKBt1iGzHmOrm6Sz4OXw3Odz4Cl2ZSnw6KxyqO306K63bG70bTB0rDI3bvI4P///////////////////////////////////yH5BAEKAB8ALAAAAAAWABYAAAVP4CeOZGmeaKqubEs2CekkErvEI1zZuOgYFlakECEZFi0GgTGKEBATFmJAVXweVOoKEQgABB9IQDCmrLpjETrQQlhHjINrTq/b7/i8fp8PAQA7" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="outdent" className="palete">+ Indentation</i>
                    {/* onClick="formatDoc('outdent');" src="data:image/gif;base64,R0lGODlhFgAWAMIHAAAAADljwliE35GjuaezxtDV3NHa7P///yH5BAEAAAcALAAAAAAWABYAAAM2eLrc/jDKCQG9F2i7u8agQgyK1z2EIBil+TWqEMxhMczsYVJ3e4ahk+sFnAgtxSQDqWw6n5cEADs=" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="indent" className="palete">- Indentation</i>
                    {/* onClick="formatDoc('indent');" src="data:image/gif;base64,R0lGODlhFgAWAOMIAAAAADljwl9vj1iE35GjuaezxtDV3NHa7P///////////////////////////////yH5BAEAAAgALAAAAAAWABYAAAQ7EMlJq704650B/x8gemMpgugwHJNZXodKsO5oqUOgo5KhBwWESyMQsCRDHu9VOyk5TM9zSpFSr9gsJwIAOw==" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  className="palete fas fa-link"
                    onClick={(e)=>{
                        var sLnk=prompt('Write the URL here','http:\/\/');
                        if(sLnk&&sLnk!=''&&sLnk!='http://'){
                            this.formatDoc('createlink',sLnk);
                        }
                    }}
                    ></i>
                    {/* onClick="var sLnk=prompt('Write the URL here','http:\/\/');if(sLnk&&sLnk!=''&&sLnk!='http://'){formatDoc('createlink',sLnk)}" src="data:image/gif;base64,R0lGODlhFgAWAOMKAB1ChDRLY19vj3mOrpGjuaezxrCztb/I19Ha7Pv8/f///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARY8MlJq7046827/2BYIQVhHg9pEgVGIklyDEUBy/RlE4FQF4dCj2AQXAiJQDCWQCAEBwIioEMQBgSAFhDAGghGi9XgHAhMNoSZgJkJei33UESv2+/4vD4TAQA7" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="cut" className="palete fas fa-cut"></i>
                    {/* onClick="formatDoc('cut');" src="data:image/gif;base64,R0lGODlhFgAWAIQSAB1ChBFNsRJTySJYwjljwkxwl19vj1dusYODhl6MnHmOrpqbmpGjuaezxrCztcDCxL/I18rL1P///////////////////////////////////////////////////////yH5BAEAAB8ALAAAAAAWABYAAAVu4CeOZGmeaKqubDs6TNnEbGNApNG0kbGMi5trwcA9GArXh+FAfBAw5UexUDAQESkRsfhJPwaH4YsEGAAJGisRGAQY7UCC9ZAXBB+74LGCRxIEHwAHdWooDgGJcwpxDisQBQRjIgkDCVlfmZqbmiEAOw==" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="copy" className="palete fas fa-copy" ></i>
                    {/* onClick="formatDoc('copy');" src="data:image/gif;base64,R0lGODlhFgAWAIQcAB1ChBFNsTRLYyJYwjljwl9vj1iE31iGzF6MnHWX9HOdz5GjuYCl2YKl8ZOt4qezxqK63aK/9KPD+7DI3b/I17LM/MrL1MLY9NHa7OPs++bx/Pv8/f///////////////yH5BAEAAB8ALAAAAAAWABYAAAWG4CeOZGmeaKqubOum1SQ/kPVOW749BeVSus2CgrCxHptLBbOQxCSNCCaF1GUqwQbBd0JGJAyGJJiobE+LnCaDcXAaEoxhQACgNw0FQx9kP+wmaRgYFBQNeAoGihCAJQsCkJAKOhgXEw8BLQYciooHf5o7EA+kC40qBKkAAAGrpy+wsbKzIiEAOw==" /> */}
                    <i onMouseDown={(e)=>e.preventDefault()}  onClick={this.paleteCommand} data-command="paste" className="palete fas fa-paste"></i>
                    {/* onClick="formatDoc('paste');" src="data:image/gif;base64,R0lGODlhFgAWAIQUAD04KTRLY2tXQF9vj414WZWIbXmOrpqbmpGjudClFaezxsa0cb/I1+3YitHa7PrkIPHvbuPs+/fvrvv8/f///////////////////////////////////////////////yH5BAEAAB8ALAAAAAAWABYAAAWN4CeOZGmeaKqubGsusPvBSyFJjVDs6nJLB0khR4AkBCmfsCGBQAoCwjF5gwquVykSFbwZE+AwIBV0GhFog2EwIDchjwRiQo9E2Fx4XD5R+B0DDAEnBXBhBhN2DgwDAQFjJYVhCQYRfgoIDGiQJAWTCQMRiwwMfgicnVcAAAMOaK+bLAOrtLUyt7i5uiUhADs=" /> */}
                </div>
                <div onInput={this.contentOnChange} className="container-fluid" ref={this.contentRef} id="textBox" contentEditable="true"><p>Fill content</p></div>
                <p/>
                <AnchorWithIcon show={this.state.updated == false} style={{marginRight:'5px'}} iconClassName="fas fa-exclamation-circle" className="btn btn-warning btn-sm" onClick={this.setValue}>Update Content</AnchorWithIcon>
                <AnchorWithIcon show={this.state.updated == true} style={{marginRight:'5px'}} iconClassName="fas fa-check" className="btn btn-primary btn-sm"  >Content Updated</AnchorWithIcon>

                <AnchorWithIcon className="btn btn-secondary btn-sm" attributes={{onMouseDown:(e)=>e.preventDefault()}} onClick={(e)=>this.setEditMode(false)} show={this.state.editMode == true} >Hide Html</AnchorWithIcon>
                <AnchorWithIcon className="btn btn-secondary btn-sm" attributes={{onMouseDown:(e)=>e.preventDefault()}} onClick={(e)=>this.setEditMode(true)} show={this.state.editMode == false} >Show Html</AnchorWithIcon>
            </div>
             
        )
    }
}
const FontSizeOption = (props: { onChange: Function }) => {
    return (
        <select className="form-control"
            onChange={
                (e) => {
                    const t = e.target;
                    props.onChange("fontsize", t.value);
                    t.value = "-";
                }}>
            {/* onChange="formatDoc('fontsize',this[this.selectedIndex].value);this.selectedIndex=0;"> */}
            <option value ="-" className="heading" selected>- size -</option>
            <option value="1">Very small</option>
            <option value="2">A bit small</option>
            <option value="3">Normal</option>
            <option value="4">Medium-large</option>
            <option value="5">Big</option>
            <option value="6">Very big</option>
            <option value="7">Maximum</option>
        </select>
    )
}
const BackgroundColorOption = (props: { onChange: Function }) => {
    return (
        <select className="form-control"
            onChange={
                (e) => {
                    const t = e.target;
                    props.onChange("backcolor", t.value);
                    t.value = "-";
                }}>
            {/* onChange="formatDoc('backcolor',this[this.selectedIndex].value);this.selectedIndex=0;"> */}
            <option value="-" className="heading" selected>- background -</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="black">Black</option>
        </select>
    )
}
const FontColorOption = (props: { onChange: Function }) => {
    return (
        <select className="form-control" onChange={
            (e) => {
                const t = e.target;
                props.onChange("forecolor", t.value);
                t.value = "-";
            }
        }>
            {/* onChange="formatDoc('forecolor',this[this.selectedIndex].value);this.selectedIndex=0;"> */}
            <option className="heading" value="-" selected>- color -</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="black">Black</option>
        </select>
    )
}
const FormattingList = (props: { onChange: Function }) => {
    return (
        <select className="form-control" onChange={
            (e) => {
                const t = e.target;
                props.onChange("formatblock", t.value);
                t.value = "-";
            }
        }>
            {/* onChange="formatDoc('formatblock',this[this.selectedIndex].value);this.selectedIndex=0;"> */}
            <option value="-" selected>- formatting -</option>
            <option value="h1">Title 1 &lt;h1&gt;</option>
            <option value="h2">Title 2 &lt;h2&gt;</option>
            <option value="h3">Title 3 &lt;h3&gt;</option>
            <option value="h4">Title 4 &lt;h4&gt;</option>
            <option value="h5">Title 5 &lt;h5&gt;</option>
            <option value="h6">Subtitle &lt;h6&gt;</option>
            <option value="p">Paragraph &lt;p&gt;</option>
            <option value="pre">Preformatted &lt;pre&gt;</option>
        </select>
    )
}
const FontList = (props: { onChange: Function }) => {
    return (<select className="form-control" onChange={
        (e) => {
            const t = e.target;
            props.onChange("fontname", t.value);
            t.value = "-";
        }
    }>
        {/* onChange="formatDoc('fontname',this[this.selectedIndex].value);this.selectedIndex=0;"> */}
        <option value="-" className="heading" selected>- font -</option>
        <option value="Arial">Arial</option>
        <option value="Arial Black">Arial Black</option>
        <option value="Courier New">Courier New</option>
        <option value="Times New Roman">Times New Roman</option>
    </select>)
}

export default withRouter(connect(
    mapCommonUserStateToProps,
)(FormInputTextEditor))