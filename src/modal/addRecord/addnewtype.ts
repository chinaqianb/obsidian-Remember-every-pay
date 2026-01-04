import {App, Modal, Notice, Setting} from "obsidian"
import ChooseModel from "./choosemodel";
import MyPlugin from "../../main";

export default class addNewType extends Modal{
	private plugin:MyPlugin
	constructor(app:App,plugin:MyPlugin) {
		super(app);
		this.plugin=plugin;
		let input=''
		new Setting(this.contentEl)
			.setName('添加新类型')
			.addText((text)=>{
				text.onChange((value)=>{input=value})
				text.inputEl.addEventListener('keydown',(eve)=>{if (eve.key==='Enter')onenter()})
			}).addExtraButton((btn)=>{
			btn.setIcon('plus')
				.onClick(()=>{
					onenter()
				})
		})
		const onenter=()=>{
			if (input===''){
				new Notice("类型不能为空")
				return;
			}
			this.plugin.settings.my_record.push(input);
			this.plugin.saveSettings()
			new ChooseModel(this.app,plugin).open();
			this.close()
		}
	}

}
