import {moment, Notice} from "obsidian";

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
	getMatch(value:string=this.date):string{
		return value.replace(/\${(\S+)}/g,(m)=>{
			return m
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

	/**
	 *将输入的文件格式匹配
	 */
	dateToMatch(mat:string=this.date):RegExp{
		const format=this.passS(mat).replace(/\.[^.]*$/, '')
		const escaped=format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const tokenMap: Record<string, string> = {
			YYYY: '\\d{4}',
			YY:   '\\d{2}',
			MM:   '\\d{2}',   // 月份，前导零
			M:    '\\d{1,2}', // 月份，无前导零
			DD:   '\\d{2}',
			D:    '\\d{1,2}',
			HH:   '\\d{2}',   // 24小时制小时
			H:    '\\d{1,2}',
			mm:   '\\d{2}',   // 分钟
			m:    '\\d{1,2}',
			ss:   '\\d{2}',   // 秒
			s:    '\\d{1,2}',
			SSS:  '\\d{3}',   // 毫秒
		};

		// 3. 按占位符长度降序替换，避免短占位符先替换破坏长占位符
		const sortedTokens = Object.keys(tokenMap).sort(
			(a, b) => b.length - a.length
		);

		const pattern = sortedTokens.reduce((result, token) => {
			// 每个 token 可能在格式中出现多次，使用全局替换
			return result.replace(new RegExp(token, 'g'), String(tokenMap[token]));
		}, escaped);

		// 4. 添加起止锚定，确保匹配整个字符串
		return new RegExp(`^${pattern}.md$`);
	//这个是专门为文件用的，其他地方要用请修改".md"位置
	}



}
