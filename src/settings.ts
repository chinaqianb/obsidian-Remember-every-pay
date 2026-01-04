import {App, moment, Notice, PluginSettingTab, Setting} from "obsidian";
import MyPlugin from "./main";
import FileFormatSet from "./filerw/fileformatset";

export interface MyPluginSettings {
	my_record:string[]
	file_sava_way:string
	every_data_hang_out:boolean
	data_sum:boolean
	data_zero_output:boolean
	random_choose_zu:Record<string,Record<string,number>>
	random_choose_time_and_n:[number,number]
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	my_record:[],
	file_sava_way:`\${YYYY}/\${YYYY-MM}.md`,
	every_data_hang_out:false,
	data_sum:true,
	random_choose_zu:{},
	random_choose_time_and_n:[500,4],
	data_zero_output:false
}

export class MySetting extends PluginSettingTab {
	plugin: MyPlugin;
	private isc=false;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		let add_value='';
		containerEl.empty();
		new Setting(containerEl)
			.setName("类型")
			.setHeading()

		new Setting(containerEl)
			.setName('添加类型')
			.setDesc('添加新的一个类型')
			.addText((text)=>{
				text.setPlaceholder('输入类型')
					.onChange(text=>{
						add_value=text
					})

			}).addExtraButton(btn=>{
				btn.setIcon('plus')
					.onClick(async ()=>{
						if (add_value===''){
							new Notice("类型不能为空")
							return;
						}
						this.plugin.settings.my_record.push(add_value)
						await this.plugin.saveSettings();
						this.display()

					})

		})
		new Setting(containerEl)
			.setName("已有的类型")
			.setHeading()
			.addExtraButton((btn)=>{
				btn.setIcon('chevron-down')
					.onClick(()=>{
						this.isc=!this.isc
						if (this.isc){
							all_type_area.style.display='none'
							btn.setIcon('chevron-right')
						}else {
							all_type_area.style.display='block'
							btn.setIcon('chevron-down')
						}
					})
			})
		const all_type_area=containerEl.createEl('div')
		render_list(all_type_area,this.plugin.settings.my_record,async (i,set)=>{
			this.plugin.settings.my_record.remove(i)
			 await this.plugin.saveSettings()
			this.display()
		})
		new Setting(containerEl)
			.setName("文件操作")
			.setHeading()
		function set_way_text(fn:()=>string):DocumentFragment{
			const file_way_dec=document.createDocumentFragment();
			file_way_dec.appendText("设置创建文件的路径方式")
			file_way_dec.createEl('br')
			file_way_dec.appendText("现在的文件夹路径如下:")
			file_way_dec.createEl('span',{
				cls:'format-preview',
				text:fn()
			})
			return file_way_dec;
		}
		const create_way=new Setting(containerEl)
			.setName("创建文件的路径")
			.setDesc(set_way_text(()=>new FileFormatSet(this.plugin.settings.file_sava_way).backData()))
			.addMomentFormat((text)=>{
				text.setValue(this.plugin.settings.file_sava_way)
				text.onChange(async (value)=>{
					create_way.setDesc(set_way_text(()=>new FileFormatSet(value).backData()))
					this.plugin.settings.file_sava_way=text.getValue()
					await this.plugin.saveSettings();
				})
				text.setDefaultFormat('YYYY MM DD')

			})


		new Setting(containerEl)
			.setName("输出格式")
			.setHeading()
		const dec=document.createDocumentFragment();
		dec.appendText("设置是否进行换行输出")
		dec.appendText("如:")
		dec.createEl('br')
		dec.appendText("换行输出:早餐:4")
		dec.createEl('br')
		dec.appendText("午餐:13")
		dec.createEl('br')
		dec.appendText("不换行输出:早餐:4+午餐13")
		new Setting(containerEl)
			.setName("每日换行输出")
			.setDesc(dec)
			.addToggle(tog=>{
				tog.setValue(this.plugin.settings.every_data_hang_out)
					.onChange(i=>{
						this.plugin.settings.every_data_hang_out=i
						this.plugin.saveSettings()
					})
			})
		new Setting(containerEl)
			.setName("每日总金额统计")
			.setDesc("每日的总金额")
			.addToggle((tog)=>{
				tog.setValue(this.plugin.settings.data_sum)
			})
		new Setting(containerEl)
			.setName("统计月份时输出消费为0的项目")
			.setDesc("开启后,会输出消费为0的项目,比如:早餐:0")
			.addToggle(t=>{
				t.setValue(this.plugin.settings.data_zero_output)
					.onChange(p=>{
						this.plugin.settings.data_zero_output=p
						this.plugin.saveSettings()
					})
			})
		let random_choose_input=''
		new Setting(containerEl)
			.setName("随机选择")
			.setHeading()
		new Setting(containerEl)
			.setName("动画时间和动画次数")
			.setDesc("设置在随机选择时骰子的动画改变次数和每次变化的时间")
			.addText(t=>{t.setPlaceholder("每次变化的时间(毫秒,1000ms->1s)").setValue(String(this.plugin.settings.random_choose_time_and_n[0])).onChange(text=>{if (text===''||/^-?\d+(\.\d+)?$/.test(text)){new Notice("输入不合法");return}this.plugin.settings.random_choose_time_and_n[0]=Number(text);this.plugin.saveSettings();this.display()})})
			.addText(t=>{t.setPlaceholder("变化的次数").setValue(String(this.plugin.settings.random_choose_time_and_n[1])).onChange(text=>{if (text===''||/^-?\d+(\.\d+)?$/.test(text)){new Notice("输入不合法");return}this.plugin.settings.random_choose_time_and_n[1]=Number(text);this.plugin.saveSettings();this.display()})})
		new  Setting(containerEl)
			.setName("增加选择的组")
			.addText(t=>{
				t.onChange(e=>{
					random_choose_input=e
				})
			}).addExtraButton(b=>{
				b.setIcon('plus')
					.onClick(async ()=>{
						if (random_choose_input===''){
							new Notice("类型为空")
							return;
						}
						this.plugin.settings.random_choose_zu[random_choose_input]={}
						await this.plugin.saveSettings()
						this.display()
					})
		})
		new Setting(containerEl)
			.setName("已有的组")
			.setHeading()
		renderRandomZu(containerEl,this.plugin.settings.random_choose_zu,
			async (n)=>{delete this.plugin.settings.random_choose_zu[n];await this.plugin.saveSettings();this.display()},
			async (n,type)=>{(<Record<string,number>>this.plugin.settings.random_choose_zu[n])[type]=1;await this.plugin.saveSettings();this.display()},
			async (n,t)=>{delete (<Record<string,number>>this.plugin.settings.random_choose_zu[n])[t];await this.plugin.saveSettings();this.display()},
			 (b,c):string=>{return String(<number>(<Record<string,number>>this.plugin.settings.random_choose_zu[b])[c])},
			async (b,c,value)=>{(<Record<string,number>>this.plugin.settings.random_choose_zu[b])[c]=Number(value);await this.plugin.saveSettings();this.display()}
			)
	}

}
function render_list(con:any,type:string[],fn:(l:string,set?:any)=>void) {
	type.forEach((i)=>{
		const setting=new Setting(con)
			.setName(i)

			.addButton(btn=>{
				btn.setIcon('trash-2')
					.onClick(()=>{
						fn(i,setting);
					})
			})
	})
}
function render_one(con:any,add_name:string,fn:(l:string,set?:any)=>void) {
	const setting=new Setting(con)
		.setName(add_name)
		.addButton(btn=>{
			btn.setIcon('delete')
				.onClick(()=>{
					fn(add_name,setting);
				})
		})
}
function renderRandomZu(con:HTMLElement,type:Record<string, Record<string,number>>,n_delete:(name:string)=>void,one_add:(name:string,type:string)=>void,one_delete:(name:string,n:string)=>void,setI:(b:string,c:string)=>string,on_change:(b:string,c:string,value:string)=>void) {
	Object.entries(type).forEach(([n,one])=>{
		let is_open:boolean=false

		const set=new Setting(con)
			.setName(n)
			.setHeading()
			.addButton(b=>{
				b.setIcon('trash-2')
					.onClick(()=>{
						n_delete(n);
					})
			})
			.addExtraButton(p=>{
				p.setIcon('chevron-down')
				p.onClick(()=> {
					is_open = !is_open;
					if (is_open) {
						dic.style.display = 'none'
						p.setIcon('chevron-right')
					} else {
						dic.style.display = 'block'
						p.setIcon('chevron-down')
					}
				})
			})
		const dic=con.createDiv()
		let add_type=''
		new Setting(dic)
			.setName("新增加类型")
			.addText(text=>{
				text.onChange(value => {
					add_type=value
				})
			}).addExtraButton(b=>{
				b.setIcon('plus')
					.onClick(()=>{
						one_add(n,add_type);
					})
		})

		Object.entries(calcRandom(one)).forEach(([e,num])=>{
			let on_c=''
			new Setting(dic)
				.setName(e)
				.setDesc(`概率为:${(num*100).toFixed(2)}%`)
				.addText(tex=>{
					tex.setValue(setI(n,e))
						.onChange(t=>{
						on_c=t
						})
				}).addExtraButton(h=>h.setIcon('check').onClick(()=>on_change(n,e,on_c)))
				.addButton(btn=>{
					btn.setIcon('trash-2')
						.onClick(()=>{
							one_delete(n,e);
						})
				})
		})
	})
}
function calcRandom(value:Record<string,number>):Record<string,number> {
	let sum:number=0
	let res:Record<string,number>={};
	Object.values(value).forEach(e=>sum+=e)
	Object.entries(value).forEach(([s,n])=>{
		res[s]=n/sum
	})

	return res
}
