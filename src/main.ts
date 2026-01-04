import {App, Editor, MarkdownView, Menu, Modal, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, MyPluginSettings, MySetting} from "./settings";
import ChooseModel from "./modal/addRecord/choosemodel";
import RecordDataIo from "./filerw/recorddataio";
import RandomChoose from "./modal/random/randomchoose";
import RandomPage from "./modal/random/startrandompage";
import FindOrWriteData from "./modal/findRecord/FindOrWirteData";
import ChooseNeedFindDate from "./modal/findRecord/ChooseNeedFindDate";
import ChooseRecordData from "./modal/deleteRecord/chooseRecordData";
import ChooseYear from "./modal/chooseyear";
import SummaryChooseDate from "./modal/summary/SummaryChooseDate";
import SummarySetting from "./modal/summary/SummarySetting";



export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();


		this.addRibbonIcon('calendar-fold', '记录', (eve) => {
			const menu=new Menu()
			menu.addItem((item)=>{
				item.setTitle('随机选择')
				item.setIcon('square-mouse-pointer')
				item.onClick(()=>{
				// new RandomChoose(this.app).open()
					new RandomChoose(this.app,this.settings.random_choose_zu,this.settings.random_choose_time_and_n).open()
				})
			})
			menu.addItem((item)=>{
				item.setTitle("添加记录")
					.setIcon('plus')
					.onClick(()=>{

					new ChooseModel(this.app,this).open();
					})
			})
			menu.addItem((item)=>{
				item.setTitle("每日金额统计")
					.setIcon("calendar-check-2")
					.onClick(()=>{
						new ChooseYear(this.app,this,async (value)=>{
							new SummaryChooseDate(this.app,this,await new RecordDataIo(this.app, this).getAllDate(value),value).open()
						}).open()
					})
			})
			menu.addItem((item)=>{
				item.setTitle("删除记录")
					.setIcon("trash-2")
					.onClick(async ()=>{
						const io=new RecordDataIo(this.app,this)
						new ChooseYear(this.app,this,async (value)=>{
						new ChooseRecordData(this.app,this,await io.getAllDate(value),value).open()}).open()
					})
			})
			menu.addItem((item)=>{
				item.setTitle("寻找和修改记录")
					.setIcon('calendar')
					.onClick(async ()=>{
						const io=new RecordDataIo(this.app,this)
						new ChooseYear(this.app,this,async (value)=>{
						new ChooseNeedFindDate(this.app,this,await io.getAllDate(value),value).open()}).open()
					})
			})
			menu.addItem((item)=>{
				item.setTitle("汇总这个月")
					.setIcon('chart-line')
					.onClick(async ()=>{
						new ChooseYear(this.app,this,async (value)=>{
							new SummarySetting(this.app,this,value)
							.open()
						}).open()

					})
			})
			menu.showAtMouseEvent(eve)

			// new Notice('This is a notice!');
		});

		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// 		// const statusBarItemEl = this.addStatusBarItem();
		// 		// statusBarItemEl.setText('Status bar text');
		// 		//
		// 		// // This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'create_this_month',
			name: '创建这个月份',
			callback: () => {
				new RecordDataIo(this.app, this).createNewFolder()
			}
		});

		this.addCommand({
			id: 'read_this_month',
			name: '读取这个月',
			callback:()=>{
				new RecordDataIo(this.app,this).readNowDataMd()
			}
		});

		this.addCommand({
			id:'test-the-use',
			name:'测试这个功能',
			callback:()=>{
				// new RecordDataIo(this.app,this).getAllFileList()
			}
		})

		this.addSettingTab(new MySetting(this.app, this));



		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MyPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}

