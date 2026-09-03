import {App, Modal, Notice, setIcon} from "obsidian";
import RandomEndPage from "./randomendpage";

export default class RandomPage extends Modal{
	rec: Record<string, number>
	time_n:[number,number]
	constructor(app:App,rec:Record<string, number>,time_n:[number,number]) {
		super(app);
		this.rec=rec
		this.time_n=time_n

	}
	onOpen(): Promise<void> | void {
		const { contentEl } = this;

		// 清空内容区域
		contentEl.empty();

		// 设置模态框的最小尺寸
		contentEl.setCssStyles({minHeight : '200px'})
		contentEl.setCssStyles({display : 'flex'})
		contentEl.setCssStyles({flexDirection : 'column'})
		contentEl.setCssStyles({justifyContent : 'center'})
		contentEl.setCssStyles({alignItems : 'center'})
		contentEl.setCssStyles({textAlign : 'center'})



		// 创建图标容器
		const iconContainer = contentEl.createDiv({
			cls: 'random-page-icon-container'
		});

		// 添加加号图标
		setIcon(iconContainer, 'dice-6');

		// 添加样式让图标更大更显眼
		iconContainer.setCssProps({'--icon-size':'80px'})
		iconContainer.setCssStyles({cursor : 'pointer'})
		iconContainer.setCssStyles({padding : '20px'})
		iconContainer.setCssStyles({borderRadius : '15px'})
		iconContainer.setCssStyles({backgroundColor:'var(--background-modifier-hover)'})
		iconContainer.setCssStyles({height:'100px'})
		iconContainer.setCssStyles({width:'100px'})
		iconContainer.setCssStyles({display:'flex'})
		iconContainer.setCssStyles({justifySelf:'center'})
		iconContainer.setCssStyles({alignItems:'center'})




		// 添加悬停效果
		iconContainer.addEventListener('mouseenter', () => {
			iconContainer.setCssStyles({backgroundColor : 'var(--background-modifier-active-hover)'})
			iconContainer.setCssStyles({transform : 'scale(1.1)'})


		});

		iconContainer.addEventListener('mouseleave', () => {
			iconContainer.setCssStyles({backgroundColor : 'var(--background-modifier-hover)'})
			iconContainer.setCssStyles({transform:'scale(1)'})


		});

		// 添加点击事件
		iconContainer.addEventListener('click', async () => {
			// this.onIconClick();
			await new Promise(r=>setTimeout(r,500))
			await change(iconContainer, this.time_n[1],this.time_n[0])
			 new RandomEndPage(this.app,this.rec).open()
			this.close();
		});


	}
}

async function change(div:HTMLDivElement,n:number,time:number) {
	for (let i=0;i<n;i++){
		change_icon(div)
		await new Promise(r=>setTimeout(r,time))
	}
}
function change_icon(div:HTMLDivElement) {
	const icon:Record<string,number>={'dice-1':10,'dice-2':10,'dice-3':10,'dice-4':10,'dice-5':10,'dice-6':10,'star':1}
	let sum:number=0
		Object.values(icon).forEach(e=>sum+=e)
	const result=Math.floor(Math.random() * (sum - 1 + 1)) + 1
	let r=0;
	for (const [k,v]of Object.entries(icon)){
		if (r<result&&result<=(r+=v)){

			setIcon(div,k)
			return;
		}
	}

}
