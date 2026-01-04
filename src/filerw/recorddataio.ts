import {App, moment, Notice, TFile} from "obsidian";
import MyPlugin from "../main";
import FileFormatSet from "./fileformatset";

export interface ThirdM {
	type:string
	pay:number
}
export default class RecordDataIo {
	 app:App
	plugin:MyPlugin
	constructor(app:App,plugin:MyPlugin) {
	this.app=app
		this.plugin=plugin
	}
	TEMP:string=`# record\n\n# summary\n\n## chart`
	 async createNewFolder(data:string=this.TEMP): Promise<void> {
		try {
			const format=new FileFormatSet(this.plugin.settings.file_sava_way)
			const now_path=format.backData()
			const file_name = format.getFileFolder()[0]
			const is_exi = await this.app.vault.adapter.exists(file_name)
			if (!is_exi) {
				await this.app.vault.createFolder(file_name);
			}
			const now_name = format.getFileFolder()[1]
			// const now_path = `${file_name}/${now_name}`
			if (!await this.app.vault.adapter.exists(now_path)) {
				const file = await this.app.vault.create(now_path, data)
				await this.app.workspace.getLeaf(true).openFile(file);
			}
		} catch (err) {
			new Notice("创建失败:" + err)
		}
	}
	 getAllFilepathList():string[]{
		let result:string[]=[]
		 try {
			 let files = this.app.vault.getFiles();
			 for (const file of files){
				 const par=/(\d{4}-\d{2})/
				 if (file.name.match(par)){
					 result.push(file.path)
				 }
			 }

		 }catch (e) {
			 new Notice("错误:"+e)
		 }
		return result
	}
	 getAllFileNameList():string[]{
		 let res=[]
		let files = this.app.vault.getFiles();
		for (const file of files){
			const par=/(\d{4}-\d{2})/
			if (file.name.match(par)){
				res.push(file.name)
			}
		}
		return res
	}
	getAllFile_Name_and_Path_List():Record<string, string>{
		let res:Record<string, string>={}
		let files = this.app.vault.getFiles();
		for (const file of files){
			const par=/(\d{4}-\d{2})/
			if (file.name.match(par)){
				res[file.name]=file.path
			}
		}
		return res
	}
	async readNowDataMd():Promise<string>{
		 // const file_name=`${moment().format('YYYY')}/${moment().format('YYYY-MM')}.md`
		const file_name=new FileFormatSet(this.plugin.settings.file_sava_way).backData()
		const file= this.app.vault.getAbstractFileByPath(file_name) as TFile
		 if (!file){
			await this.createNewFolder()
			 return this.TEMP
		 }
		 const con=await this.app.vault.read(file)

		 return con.trim()
	}
	async readThatDateMd(path:string):Promise<string>{
		 const file=this.app.vault.getAbstractFileByPath(path) as TFile
		if (!file){
			new Notice("发生错误:"+path+"文件不存在")
		}
		return await this.app.vault.read(file)
	}
	async writeNowDataMd(con:string){
		const file_name=new FileFormatSet(this.plugin.settings.file_sava_way).backData()
		// const file_name=`${moment().format('YYYY')}/${moment().format('YYYY-MM')}.md`
		const file= this.app.vault.getAbstractFileByPath(file_name) as TFile
		if (!file){

			await this.createNewFolder()
		}

		await this.app.vault.modify(file,con)
	}
	async writeThatDateMd(con:string,path:string){
		const file= this.app.vault.getAbstractFileByPath(path) as TFile
		if (!file){

			await this.createNewFolder()
		}

		await this.app.vault.modify(file,con)
	}
	async hasFile(file_name:string):Promise<boolean>{
		 return this.app.vault.adapter.exists(file_name)
	}
	jumpToSome(con:string,need:string):number | null{
		 if (con.includes(need)){
			 const need_index=need.length
			 return con.indexOf(need)+need_index
		 }
		 return null;
	}
	addNewConOnMiddle(con:string,need:string,new_con:string):string{
		 const index=this.jumpToSome(con,need);
		 if (index==null){return ''}

		 return con.slice(0,index)+new_con+con.slice(index);
	}
	addConOnMiddleByIndex(con:string,index:number,new_con:string):string{
		 return con.slice(0,index)+new_con+con.slice(index)
	}
	dataToBlock(con:string):string[]{
		const patter=/## \d{4}-\d{2}-\d{2}[\s\S]*?---/g;
		return con.match(patter)||[]
	}
	//下面这两个函数有问题
	dataAppendTo(is:boolean,con:string,today:string,in_content:string,data:string):string{
		const index=(<number>this.jumpToSome(con,`## ${today}`))+in_content.length+1
		 if (is){
			 //换行输出
			return this.addConOnMiddleByIndex(con,index,`\n${data}`)
		 }else{
			 //不换行输出

			 return this.addConOnMiddleByIndex(con,index,`+${data}`)
		 }
	}
	async addThatDateRecord(m:ThirdM,today:string,path:string){
		let con:string=await this.readThatDateMd(path)
		const data=`${m.type}:${m.pay}`
		const block=this.dataToBlock(con)
		if (block.some(i=>i.includes(today))){
			const today_data=<string>block.filter(i=>i.includes(today)).first()
			const par= /##\s*\d{4}-\d{2}-\d{2}\s*\n([\s\S]*?)\n+---/;
			const mat=today_data.match(par)
			const in_content=mat?.[1];//中间的数据
			if (/\S/.test(<string>in_content)){

				await this.writeThatDateMd(this.dataAppendTo(this.plugin.settings.every_data_hang_out,con,today,<string>in_content,data),path)
			}else {

				await this.writeThatDateMd(this.addNewConOnMiddle(con, `## ${today}\n`, `${data}`),path)
			}
		}
	}
	async addTodayNewRecord(m:ThirdM){
		const con:string=await this.readNowDataMd()
		const today=moment().format('YYYY-MM-DD')
		 const data=`${m.type}:${m.pay}`
		const block=this.dataToBlock(con)
		if (block.some(i=>i.includes(today))){
			//有今天的日期,分为开始和后追加
			const today_data=<string>block.filter(i=>i.includes(today)).first()//一个block里面的数据
			const par= /##\s*\d{4}-\d{2}-\d{2}\s*\n([\s\S]*?)\n+---/;
			const mat=today_data.match(par)
			const in_content=mat?.[1];//中间的数据
			if (/\S/.test(<string>in_content)){
				//不是第一个

				await this.writeNowDataMd(this.dataAppendTo(this.plugin.settings.every_data_hang_out,con,today,<string>in_content,data))
			}else {
				//第一个

				await this.writeNowDataMd(this.addNewConOnMiddle(con, `## ${today}\n`, `${data}`))
			}
		}else{
			//没有今天日期,分为文件已创建(内没有内容，可能#也没有),文件未创建
			if (!await this.hasFile(new FileFormatSet(this.plugin.settings.file_sava_way).backData())){
				//没有文件,连同数据一起塞进去
				await this.createNewFolder(this.addNewConOnMiddle(this.TEMP,"# record\n",`## ${today}\n${data}\n\n---`));
			}else{
				//有文件，分为一个日期都没有，有日期(要塞到后面),什么东西都没有
				if (!(con.trim().length>0)){
					//什么都没有的情况
					await this.writeNowDataMd(this.addNewConOnMiddle(this.TEMP,"# record\n",`## ${today}\n${data}\n\n---`))
					return
				}
				if (block.length>0){
					//有日期

					const par= /##\s*(\d{4}-\d{2}-\d{2})/;
					let maxD: string | null = null;
					let latest: string | null = null;
					for (const d of block){

						const mat=d.match(par)
						if (mat){

							const curr=<string>mat[1];
							if (maxD===null||curr>maxD){
								maxD=curr
								latest=d
							}
						}
					}
					// new Notice(<string>maxD+<string>latest)

					await this.writeNowDataMd(this.addConOnMiddleByIndex(con,<number>this.jumpToSome(con, <string>latest),`\n## ${today}\n${data}\n\n---`))
				}else {

					//没有日期
					await this.writeNowDataMd(this.addNewConOnMiddle(con,"# record\n",`## ${today}\n${data}\n\n---`))
				}

			}
		}

	}
	async deleteTheDateInfo(date:string,path:string,type:string,value:number){
		const con:string=await this.readThatDateMd(path)
		const one=await this.findDateBack(date,path)
		let find:string='';
		//+type:value的情况


		for (const [k,v]of one){
			if (k===type&&v===value){
				find=`${k}:${v}`
				break;
			}
		}
		// if (find===''){
		// 	//+type:value的情况
		// 	for (const [k,v]of one){
		// 		if (k===type&&v===value){
		// 			find=`${k}:${v}+`
		// 			break;
		// 		}
		// 	}
		// }
		// if (find===''){
		// 	//type:value的情况
		// 	for (const [k,v]of one){
		// 		if (k===type&&v===value){
		// 			find=`${k}:${v}`
		// 			break;
		// 		}
		// 	}
		// }
		if (find!=''){
			const after =con.indexOf(date)
			const index=con.indexOf(find,after+date.length)
			if(con.charAt(index-1)==='+'){
				await this.writeThatDateMd(con.substring(0,index-1)+''+con.substring(index+find.length),path)
			}else if (con.charAt(index+find.length)==='+'){
				await this.writeThatDateMd(con.substring(0,index)+''+con.substring(index+find.length+1),path)
			}else if (con.charAt(index-1)==='\n'){
				await this.writeThatDateMd(con.substring(0,index-1)+''+con.substring(index+find.length),path)
			}
			else
			await this.writeThatDateMd(con.substring(0,index)+''+con.substring(index+find.length),path)
		}

	}
	async changeTheDateInfo(date:string,path:string,type:string,value:number,new_type:string,new_value:number){
		const con:string=await this.readThatDateMd(path)
		 const one=await this.findDateBack(date,path)
		let find:string='';

		for (const [k,v]of one){
			if (k===type&&v===value){
				find=`${k}:${v}`
				break;
			}
		}

		if (find!=''){
		const after =con.indexOf(date)
		const index=con.indexOf(find,after+date.length)
			await this.writeThatDateMd(con.substring(0,index)+`${new_type}:${new_value}`+con.substring(index+find.length),path)
		}
	}
	async getAllDate(path:string){
		const con:string=await this.readThatDateMd(path)
		const block=this.dataToBlock(con)
		const par= /##\s*(\d{4}-\d{2}-\d{2})/;
		let back_date:string[]=[]
		for(const one of block){
			const mat=one.match(par)
			if (mat){
				back_date.push(<string>mat[1])
			}
		}
		return back_date
	}
	async findDateBack(date:string,path:string){
		const con:string=await this.readThatDateMd(path)
		const block=this.dataToBlock(con)
		const today_data=<string>block.filter(i=>i.includes(date)).first()
		const p= await this.summaryTodayDataAfter(today_data, "")

		const totalIndex = p.findIndex(([key]) => key === "总计");
		if (totalIndex > -1) {
			//删除总计
			p.splice(totalIndex, 1);
		}
		return p

	}
	async summaryTodayDataAfter(mid:string,data:string){
		 let pair:[string,number][]=[]
		if (mid.includes('+')){
			//不换行的情况
			(<string>mid.split('\n').filter(p=>p.includes(':')).first())//得到中间部分
				.trim().split('+').forEach((e)=>{
					const [key,value]=e.trim().split(':');
					if (key&&value){
						pair.push([key,Number(value)])
					}
			})
		}else {
			//换行的情况
			mid.split('\n').filter(p=>p.includes(':')).forEach(e=>{
				const [key,value]=e.trim().split(':');
				if (key&&value){
					pair.push([key,Number(value)])
				}
			})
		}
		return pair
	}
	async summaryBackData(plugin:MyPlugin,path:string):Promise<Map<string,number>>{
		const con=await this.readThatDateMd(path)as string;
		const block:string[]=this.dataToBlock(con)
		const toMonth=moment().format('YYYY-MM-DD')
		let collect_map:Map<string,number>=new Map<string, number>();
		plugin.settings.my_record.forEach((i)=>{
			collect_map.set(i,0)
		})
		//block.forEach((i)=>new Notice(i))

		block.forEach((l)=>{
			if (l.includes('+')){
				// new Notice("in")
				l.split('\n').filter((p)=>p.includes(':')).forEach((value)=> {

					value.trim().split('+').forEach((one) => {
						// new Notice(one)
						const [key, value] = one.trim().split(':');
						if (key && value && collect_map.has(key)) {
							collect_map.set(key, Number(collect_map.get(key)) + Number(value))
						}
					})
				})
			}else{
				l.split('\n').filter((p)=>p.includes(':')).forEach((v)=>{
					const [key, value] = v.trim().split(':');
					if (key && value && collect_map.has(key)) {

						collect_map.set(key, Number(collect_map.get(key) + value))
					}
				})
			}
		})
		return collect_map
	}
	async summaryMonthData(plugin:MyPlugin,path:string,zero_output:boolean,all_pay=true):Promise<Map<string, number>>{
		let collect_map= await this.summaryBackData(plugin,path)
		const con=await this.readThatDateMd(path)as string;
		//new Notice(`蜜雪:${collect_map.get("蜜雪")}`)
		let summary_str='\n';
		for (const [key,value]of collect_map){
			if (!zero_output)if (value===0){collect_map.delete(key);continue;}
			summary_str=summary_str+`${key}:${value}\n`
		}

		if (all_pay)summary_str=summary_str+`总金额:${await this.summaryAllPay(plugin, path)}\n`
		await this.writeThatDateMd(this.addNewConOnMiddle(con,"# summary",summary_str),path)

		return collect_map
	}

	/**
	 * 在一个文件内所有金额的总结
	 * @param plugin
	 * @param path
	 */
	async summaryAllPay(plugin:MyPlugin,path:string):Promise<number>{
		 let map = await this.summaryBackData(plugin,path);
		 let sum=0;
		 for (const [,value] of map.entries()){
			 sum+=value;
		 }

		 return sum
	}

	/**
	 * 一天的金额总结
	 * @param path
	 * @param date
	 */
	async summaryOneDate(path:string,date:string){
		 const con=await this.readThatDateMd(path)
		 const data= await this.findDateBack(date, path)
		let sum:number=0
		for (const [k,v] of data){

			sum+=v
		}
		const block=this.dataToBlock(con)
		if (block.some(i=>i.includes(date))) {

			const today_data = <string>block.filter(i => i.includes(date)).first()//一个block里面的数据
			const par = /##\s*\d{4}-\d{2}-\d{2}\s*\n([\s\S]*?)\n+---/;
			const mat = today_data.match(par)
			const in_content = mat?.[1]as string;//中间的数据
			if (in_content.includes("总计:")){

				await this.writeThatDateMd(con.replace(today_data,today_data.replace(/总计:\d+\n/,`总计:${sum}\n`)),path)
				return;
			}
				await this.writeThatDateMd(this.dataAppendTo(true, con, date, in_content, `总计:${sum}\n`),path)
		}
	}
	async addCharts(type:Map<string, number>,path:string){
		 let type_list=Array.from(type.keys())
		let pay_list=Array.from(type.values())
		const type_out=`[${type_list.join(',')}]`
		const pay_out=`[${pay_list.join(',')}]`
		 const chart=`
\`\`\`chart
type: radar
labels: ${type_out}
series:
 - title: 花费
   data: ${pay_out}
tension: 0.13
width: 80%
labelColors: false
fill: true
beginAtZero: false
bestFit: false
bestFitTitle: undefined
bestFitNumber: 0
\`\`\``
		const con=await this.readThatDateMd(path) as string;
		await this.writeThatDateMd(this.addNewConOnMiddle(con,"## chart",'\n'+chart),path);
	}
}

