{
	/** VERSION **/
	let 	v=2046;
	/** FUNCTIONS **/
	const 	$=i=>d.getElementById(i),
		Q=s=>d.querySelector(s),
	/** CONSTANTS **/
		w=window,
		d=document,
		l=localStorage,
		u=new URL(w.location),
		a=`${u.protocol}//${u.host+u.pathname}`,
		s=`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="`,
	/** ELEMENTS **/
		h=d.documentElement,
		b=d.body,
		c=Q`meta[name=theme-color]`,
		f=$`filter`,
		i=$`icons`,
		m=$`content`,
		o=$`load`,
	/** PAGE **/
		page={
			params:u.searchParams,
			header:$`header`,
			heading:i.querySelector`h2`,
			message:$`message`,
			textarea:d.createElement`textarea`,
		/** SET UP **/
			init(){
				this.textarea.classList.add("ln","pa");
				categories.init();
				favourites.init();
				menu.init();
				icons.init();
				info.init();
				filter.init();
				let 	section=this.params.get`section`,
					filters=this.params.get`categories`,
					search=this.params.get`filter`,
					icon=this.params.get`icon`;
				if(section&&(section=categories.list[section].section))
					menu.goto(section);
				if(filters)
					filters.split`,`.forEach(x=>{
						categories.list[x].item.classList.add("active");
						filter.categories.add(x);
					});
				if(search)
					filter.text=(f.value=search.toLowerCase()).replace(/\+/g,"%2b");
				if(filters||search)
					filter.apply();
				if(icon){
					if(icons.list[icon]){
						info.open(icon);
						icons.list[icon].article.dataset.current="true";
					}
				}
				m.addEventListener("click",event=>{
					let 	target=event.target,
						parent=target.parentNode,
						current=m.querySelector`[data-current=true]`;
					switch(target.nodeName.toLowerCase()){
						case"h2":
							if(parent!==i&&parent!==categories.list.favourites.section)
								page.copy(`${a}?section=${parent.dataset.name}${u.hash}`,"Link");
							break;
						case"article":
							if(current)
								current.removeAttribute`data-current`;
							icons.ripple(target,event.clientX,event.offsetY+target.offsetTop);
							info.open(target.lastChild.nodeValue);
							target.dataset.current="true";
							break;
					}
				},0);
				setTimeout(_=>{
					o.classList.add`oz`;
					o.classList.add`pen`;
					m.classList.remove`oz`;
					setTimeout(_=>
						o.remove()
					,375);
				},10);
			},
		/** TOAST NOTIFICATIONS **/
			alert(msg){
				if(this.timer)
					clearTimeout(this.timer);
				this.message.firstChild.nodeValue=msg;
				this.message.classList.remove`oz`;
				this.timer=setTimeout(_=>
					this.message.classList.add`oz`
				,5000);
			},
		/** COPY TO CLIPBOARD **/
			copy(str,msg){
				b.append(this.textarea);
				this.textarea.value=str;
				this.textarea.select();
				d.execCommand`copy`;
				this.textarea.remove();
				this.alert(`${msg} copied to clipboard.`);
			},
		/** GET JSON **/
			get:file=>
				fetch(`json/${file}.json`).then(resp=>resp.json())
		},
	/** MENU **/
		menu={
			show:0,
			fns:{},
			nav:$`nav`,
			header:$`navicon`,
			menu:$`menu`,
			categories:$`categories`,
			init(){
				this.nav.addEventListener("click",event=>{
					let target=event.target;
					if(target===favourites.actions.import)
						favourites.import();
					else if(target===favourites.actions.export)
						favourites.export();
					else if(target===this.nav||target===this.header)
						this.toggle();
					else if(target.nodeName.toLowerCase()==="li"){
						let 	category=target.dataset.category,
							section=categories.list[category];
						if(section){
							if(section=section.section)
								this.goto(section);
							else{
								target.classList.toggle("active");
								filter.categories[filter.categories.has(category)?"delete":"add"](category);
								filter.apply();
							}
						}
					}
				},0);
				d.addEventListener("touchstart",event=>{
					this.width=this.menu.offsetWidth;
					this.cx=event.touches[0].clientX;
					if(([m,b].includes(event.target)&&!this.show&&this.cx<=50)||(this.show&&this.cx>this.width)){
						this.touchstart();
						d.addEventListener("touchmove",this.fns.move=event=>{
							let cx=event.touches[0].clientX-this.cx;
							this.nav.style.background=`rgba(0,0,0,${Math.min((cx+(this.show?285.185:0))/285.185*.54,.54)})`;
							this.menu.style.left=`${this.show?Math.min(Math.max(cx,-this.width),0):Math.min(Math.max(cx,this.width-this.width)-this.width,0)}px`;
							this.menu.style.boxShadow=`0 14px 28px rgba(0,0,0,${Math.min((cx+(this.show?500:0))/500*.25,.25)}),0 10px 10px rgba(0,0,0,${Math.min((cx+(this.show?545.545:0))/545.545*.22,.22)})`;
							event.stopPropagation();
						},0);
						d.addEventListener("touchend",this.fns.end=event=>this.touchend(this.show?this.cx-event.changedTouches[0].clientX:event.changedTouches[0].clientX-this.cx),0);
						event.stopPropagation();
					}
				},0);
			},
			toggle(){
				this.nav.dataset.show=(this.show=!this.show).toString();
				this.show?b.addEventListener("keydown",this.fns.close=event=>{
					if(event.keyCode===27)
						this.toggle();
				},0):b.removeEventListener("keydown",this.fns.close);
			},
			goto(section){
				let 	to=section.offsetTop-page.header.offsetHeight,
					top=m.scrollTop,
					step=(to-top)/20;
				this.timer=setInterval(_=>
					Math.round(top)===Math.round(to)?clearInterval(this.timer):m.scrollTop=(top+=step)
				,10);
			},
			touchstart(){
				b.classList.add`dragging`;
				this.nav.style.transition=this.menu.style.transition="none";
			},
			touchend(cx){
				d.removeEventListener("touchmove",this.fns.move);
				d.removeEventListener("touchend",this.fns.end);
				this.nav.removeAttribute`style`;
				this.menu.removeAttribute`style`;
				if(cx>=this.width/2)
					this.toggle();
				b.classList.remove`dragging`;
			}
		},
	/** SEARCH **/
		filter={
			categories:new Set(),
			button:f.nextElementSibling,
			link:i.firstElementChild,
			error:i.querySelector`p`,
			init(){
				f.addEventListener("input",_=>{
					if(this.timer)
						clearTimeout(this.timer);
					this.timer=setTimeout(_=>{
						this.text=f.value.toLowerCase().replace(/\+/g,"%2b");
						this.apply();
					},50);
				},0);
				this.button.addEventListener("click",_=>{
					f.focus();
					if(this.text){
						f.value="";
						f.dispatchEvent(new Event("input"));
					}
				},0);
				this.link.addEventListener("click",_=>
					page.copy(this.url,"Link")
				,0);
			},
			apply(){
				if(m.scrollTop<i.offsetTop-page.header.offsetHeight)
					menu.goto(i);
				i.dataset.filtered=(this.filtered=!!this.text||!!this.categories.size).toString();
				this.link.firstChild.nodeValue=this.filtered?`Search Results`:`All Icons`;
				let 	words=this.text&&this.text.split(/[\s\-]/),
					match=0,
					check,icon,article,array;
				for(let key in icons.list)
					if(icons.list.hasOwnProperty(key)){
						check=true;
						icon=icons.list[key];
						article=icon.article;
						if(this.categories.size)
							check=icon.categories&&icon.categories.some(x=>this.categories.has(x));
						if(this.text){
							array=key.split`-`;
							if(icon.aliases)
								array=array.concat(icon.aliases);
							if(icon.keywords)
								array=array.concat(icon.keywords);
							check=check&&words.every(word=>array.some(item=>item.startsWith(word)));
						}
						article.classList.toggle("dn",!check);
						match=match||check;
					}
				this.error.classList.toggle("dn",match);
				this.link.classList.toggle("pen",!this.filtered||!match);
				if(this.filtered){
					this.url=`${a}?`;
					if(this.categories.size){
						this.url+=`categories=${[...this.categories].sort().join`,`}`;
						if(this.text)
							this.url+=`&`;
					}
					if(this.text)
						this.url+=`filter=${encodeURIComponent(this.text)}`;
					if(m.scrollTop<i.offsetTop-page.header.offsetHeight)
						m.scrollTop=i.offsetTop-page.header.offsetHeight
				}
			}
		},
	/** FAVOURITES **/
		favourites={
			anchor:d.createElement`a`,
			input:d.createElement`input`,
			favourite:0,
			reader:new FileReader(),
			init(){
				this.input.accept=".txt,text/plain";
				this.input.classList.add("ln","pa");
				this.input.type="file";
				this.input.addEventListener("change",_=>{
					if(this.input.files[0].type==="text/plain")
						this.reader.readAsText(this.input.files[0]);
				},0);
				this.reader.addEventListener("load",event=>
					this.load(event)
				,0);
				this.section=categories.list.favourites.section;
				this.heading=this.section.firstElementChild;
				this.articles=this.section.getElementsByTagName`article`;
				this.actions={
					export:Q`#categories>[data-action=export]`,
					import:Q`#categories>[data-action=import]`
				}
			},
			set(icon){
				this.favourite=!this.favourite;
				info.actions.favourite.dataset.icon=String.fromCharCode(`0x${this.favourite?"f0c6":"f0c5"}`);
				info.actions.favourite.firstChild.nodeValue=`${this.favourite?"Remove from":"Add to"} Favourites`;
				if(this.favourite){
					l.setItem(`mdi-${icon}`,1);
					this.section.append(Q(`article[data-name=${icon}]`).cloneNode(1));
					this.section.querySelector(`:scope>[data-name=${icon}]`).removeAttribute`data-current`;
					if(this.array)
						this.array.push(`mdi-${icon}`);
					if(this.articles.length>1)
						this.sort();
				}else{
					l.removeItem(`mdi-${icon}`);
					this.section.querySelector(`:scope>[data-name=${icon}`).remove();
					if(this.array)
						this.array=this.array.filter(item=>item!==`mdi-${icon}`);
				}
			},
			sort(){
				let articles=[...this.articles];
				articles.sort((a,b)=>a.lastChild.nodeValue<b.lastChild.nodeValue?1:-1);
				while(this.heading.nextElementSibling)
					this.section.lastChild.remove();
				articles.forEach(item=>this.section.insertBefore(item,this.heading.nextSibling));
			},
			import(){
				b.append(this.input);
				this.input.click();
			},
			load(event){
				let msg="complete";
				try{
					(this.array=atob(event.target.result).split`,`).forEach(item=>{
						let name=item.substr(4);
						if(icons.list[name]){
							if(!(typeof l[item]!=="undefined"&&!!l[item])){
								l.setItem(item,1);
								this.section.append(Q(`article[data-name=${name}]`).cloneNode(1));
								this.section.querySelector(`:scope>[data-name=${name}]`).removeAttribute`data-current`;
								if(info.current===name){
									this.favourite=1;
									info.actions.favourite.dataset.icon="\uf0c6";
									info.actions.favourite.firstChild.nodeValue="Remove from Favourites";
								}
							}
						}
					});
					if(this.articles.length>1)
						this.sort();
				}catch(err){
					console.log(err);
					msg="failed";
				}
				page.alert(`Import ${msg}.`);
				this.input.value="";
				this.input.remove();
			},
			export(){
				this.anchor.href=`data:text/plain;base64,${btoa(btoa(this.array?this.array.join(","):Object.keys(l).join(",")))}`;
				this.anchor.download="mdi-favourites.txt";
				this.anchor.click();
			}
		},
	/** SIDEBAR **/
		info={
			aside:$`info`,
			heading:$`name`,
			figure:$`preview`,
			img:d.createElement`img`,
			input:$`slider`,
			copy:1,
			actions:{
				favourite:Q`#actions>:first-child`,
				downloads:{
					svg:Q`#actions>[data-type=svg]`,
					xaml:Q`#actions>[data-type=xaml]`,
					xml:Q`#actions>[data-type=xml]`
				},
				path:Q`#actions>[data-confirm=Path]`,
				icon:Q`#actions>[data-confirm=Icon]`,
				hex:Q`#actions>[data-confirm=Unicode]`,
				entity:Q`#actions>[data-confirm=Entity]`,
				css:Q`#actions>[data-confirm=CSS]`,
				js:Q`#actions>[data-confirm=JavaScript]`,
				html:Q`#actions>[data-confirm=HTML]`,
				url:Q`#actions>[data-confirm=Link]`,
				link:Q`#actions>:last-child`
			},
			anchor:d.createElement`a`,
			show:0,
			init(){
				/*if(!["ftp:","http:","https:"].includes(u.protocol))
					this.actions.url.classList.add`dn`;*/
				this.img.classList.add`dib`;
				this.img.height=this.img.width=56;
				this.img.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
				this.figure.append(this.img);
				this.set(Object.keys(icons.list)[0]);
				this.aside.addEventListener("click",event=>{
					let target=event.target;
					switch(target){
						case this.aside:
						case this.heading:
							this.toggle();
							break;
						case this.actions.favourite:
							favourites.set(this.name);
							break;
						case this.actions.downloads.svg:
							this.type="svg";
							this.download();
							break;
						case this.actions.downloads.xaml:
							this.type="xaml";
							this.download();
							break;
						case this.actions.downloads.xml:
							this.type="xml";
							this.download();
							break;
						case this.actions.path:
							if(this.path)
								page.copy(target.dataset.copy,target.dataset.confirm);
							else page.alert`Not yet available.`;
							break;
						case this.actions.link:
							if(this.aside.dataset.retired==="false")
								w.location.href=target.dataset.url;
							else page.alert`No longer available.`;
							break;
						default:
							if(target.parentNode===this.actions.favourite.parentNode)
								if(this.copy||target===this.actions.url)
									page.copy(target.dataset.copy,target.dataset.confirm);
								else page.alert(`No${this.aside.dataset.retired==="false"?"t yet":" longer"} available.`);
							break;
					}
				},0);
				this.input.addEventListener("input",_=>
					this.img.style.height=this.img.style.width=`${this.input.value}px`
				,0);
			},
			open(icon){
				this.set(icon);
				this.current=icon;
				this.figure.classList.add`oz`;
				setTimeout(_=>
					this.figure.classList.remove`oz`
				,10);
				this.toggle();
			},
			set(name){
				favourites.favourite=typeof l[`mdi-${name}`]!=="undefined"&&!!l[`mdi-${name}`];
				let 	icon=icons.list[name],
					hex=icon.hex;
				this.name=this.heading.firstChild.nodeValue=name;
				this.path=icon.path;
				this.actions.favourite.dataset.icon=String.fromCharCode(`0x${favourites.favourite?"f0c6":"f0c5"}`);
				this.actions.favourite.firstChild.nodeValue=`${favourites.favourite?"Remove from":"Add to"} Favourites`;
				this.actions.url.dataset.copy=`${a}?icon=${name}${u.hash}`;
				this.actions.html.dataset.copy=`<span class=mdi-${name}"></span>`;
				this.actions.link.dataset.url=`https://materialdesignicons.com/icon/${name}`;
				this.img.src=`data:image/svg+xml;utf8,${s+this.path}"/></svg>`;
				this.aside.dataset.nocopy=(!(this.copy=!!hex)).toString();
				this.aside.dataset.nodownload=(!this.path).toString();
				this.aside.dataset.retired=(!!icon.retired).toString();
				this.actions.path.dataset.copy=this.path;
				this.actions.icon.dataset.copy=hex?String.fromCharCode(`0x${hex}`):"\xa0";
				this.actions.hex.dataset.copy=hex;
				this.actions.entity.dataset.copy=`&#x${hex};`;
				this.actions.css.dataset.copy=`\\${hex}`;
				this.actions.js.dataset.copy=`\\u${hex}`;
			},
			download(){
				if(icons.list[this.name]){
					if(this.path){
						switch(this.type){
							case"svg":
								this.anchor.href=`data:text/svg+xml;utf8,${s+this.path}"/></svg>`;
								break;
							case"xaml":
								this.anchor.href=`data:text/xaml+xml;utf8,<?xml version="1.0" encoding="UTF-8"?><Canvas xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml" Width="24" Height="24"><Path Data="${this.path}"/></Canvas>`;
								break;
							case"xml":
								this.anchor.href=`data:text/xml;utf8,<vector xmlns:android="http://schemas.android.com/apk/res/android" android:height="24dp" android:width="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#000" android:pathData="${this.path}"/></vector>`;
								break;
							default:
								page.alert`Unknown file type.`;
								break;
						}
						this.anchor.download=`${this.name}.${this.type}`;
						this.anchor.click();
					}else page.alert`Download not available.`;
				}else page.alert`Icon not found.`;
			},
			toggle(){
				this.aside.dataset.show=(this.show=!this.show).toString();
				c.content=`#${this.show?"ff5722":"2196f3"}`;
				if(this.show)
					b.addEventListener("keydown",this.close=event=>{
						if(event.keyCode===27)
							this.toggle();
					},0);
				else{
					let current=m.querySelector`[data-current=true]`;
					if(current)
						current.removeAttribute`data-current`;
					b.removeEventListener("keydown",this.close);
				}
			}
		},
	/** CATEGORIES **/
		categories={
			section:d.createElement`section`,
			heading:d.createElement`h2`,
			item:d.createElement`li`,
			text:d.createElement`p`,
			init(){
				this.section.classList.add("df","pr");
				this.heading.classList.add("oh","ps");
				this.heading.append(d.createTextNode``);
				this.item.classList.add`cp`;
				this.item.tabIndex=-1;
				this.item.append(d.createTextNode``);
				for(let key in this.list)
					if(this.list.hasOwnProperty(key))
						this.add(key);
			},
			add(key){
				let 	category=this.list[key],
					section=this.section.cloneNode(0),
					heading=this.heading.cloneNode(1),
					item=this.item.cloneNode(1);
				if(category.section){
					section.dataset.name=key;
					heading.firstChild.nodeValue=category.name;
					section.append(heading);
					i.before(category.section=section);
				}
				item.firstChild.nodeValue=category.name;
				item.dataset.icon=String.fromCharCode(`0x${category.hex}`);
				item.dataset.category=key;
				menu.categories.append(category.item=item);
				if(key==="favourites"){
					item=item.cloneNode(1);
					item.removeAttribute`data-category`;
					item.dataset.action="import";
					item.dataset.icon="\uf220";
					item.firstChild.nodeValue="Import Favourites";
					menu.categories.append(item);
					item=item.cloneNode(1);
					item.dataset.action="export";
					item.dataset.icon="\uf21d";
					item.firstChild.nodeValue="Export Favourites";
					menu.categories.append(item);
				}
			}
		},
	/** CONTRIBUTORS **/
		/*contributors={},*/
	/** ICONS **/
		icons={
			article:d.createElement`article`,
			span:d.createElement`span`,
			img:d.createElement`img`,
			init(){
				this.article.classList.add("cp","fwm","oh","pr","toe","wsnw");
				this.article.append(d.createTextNode``);
				this.span.classList.add("ripple","db","pa","pen");
				this.img.classList.add("pa","pen");
				this.img.height=this.img.width=24;
				for(let key in this.list)
					if(this.list.hasOwnProperty(key))
						this.add(key);
			},
			add(key){
				let 	icon=this.list[key],
					article=this.article,
					img=this.img,
					hex=icon.hex,
					sections=categories.list,
					section;
				article.dataset.icon=hex?String.fromCharCode(`0x${hex}`):"";
				if(!hex){
					img.src=`data:image/svg+xml;utf8,${s+icon.path}"/></svg>`;
					article.prepend(img);
				}else img.remove();
				article.lastChild.nodeValue=key;
				if(l[`mdi-${key}`]&&(section=favourites.section))
					section.append(article.cloneNode(1));
				if(icon.added===v&&(section=sections.new.section))
					section.append(article.cloneNode(1));
				if(icon.updated===v&&(section=sections.updates.section))
					section.append(article.cloneNode(1));
				if(!hex&&!icon.retired&&(section=sections.soon.section))
					section.append(article.cloneNode(1));
				if(icon.retired&&(section=sections.retired.section))
					section.append(article.cloneNode(1));
				i.append(icon.article=article.cloneNode(1));
			},
			ripple(target,x,y){
				let span=this.span.cloneNode(0);
				target.prepend(span);
				span.style.height=span.style.width=`${Math.min(target.offsetHeight,target.offsetWidth)}px`;
				span.style.left=`${x-target.getBoundingClientRect().left}px`;
				span.style.top=`${y-target.offsetTop}px`;
				setTimeout(_=>
					span.remove()
				,875);
			}
		};
	/** INITIATE **/	
	page.get`categories`.catch(err=>{
		console.log(err);
		page.alert`Failed to load category data.`;
	}).then(json=>{
		categories.list=json;
		page.get`icons`.catch(err=>{
			console.log(err);
			page.alert`Failed to load icon data.`;
		}).then(json=>{
			icons.list=json;
			page.init();
		});
	});
}
