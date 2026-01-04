import {moment} from "obsidian";

export default class FileFormatSet{
	date:string
	constructor(date:string) {
		this.date=date

	}
	parse(value:string,r:Record<string,string>):string{
		return value.replace(/\${(\w+)}/g,(match,key)=>{
			return r[key] !==undefined ? r[key]:match
		})
	}
	dataParse(value:string):string{
		return value.replace(/\${(\S+)}/g,(m)=>{
			return moment().format(m)
		})
	}
	passS(value:string):string{
		return value.replace(/[${}]/g,'')
	}
	backData(value:string=this.date):string{
		return this.passS(this.dataParse(value))
	}
	getFileFolder(value:string=this.backData()):[string,string]{
		const last=value.lastIndexOf('/')
		return [value.substring(0, last), value.substring(last + 1)]

	}
	dataOut(value:string):string{
		const record:Record<string, string>={


		}
		return "k"
	}

}
