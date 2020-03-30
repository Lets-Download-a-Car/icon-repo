(async()=>{
	const 	data=Object.entries(await(await fetch(`https://houseofdesign.ie/data/icons/simpleicons.json`)).json()),
		meta=(await(await fetch(`https://raw.githubusercontent.com/simple-icons/simple-icons/develop/_data/simple-icons.json`)).json()).icons,
		count=(await(await fetch(`https://raw.githubusercontent.com/simple-icons/simple-icons/master/_data/simple-icons.json`)).json()).icons.length,
		inputs={
			data:document.getElementById(`data`),
			overlay:document.getElementById(`overlay`),
			colour:document.getElementById(`colour`),
			name:document.getElementById(`name`),
			action:document.getElementById(`action`)
		},
		text={
			type:document.getElementById(`type`),
			file:document.getElementById(`filename`),
			brand:document.getElementById(`brand`),
			color:document.getElementById(`color`)
		},
		svg=document.querySelector(`figure>svg`),
		background=document.getElementById(`background`),
		path=document.querySelector(`#path>path`),
		compare=document.getElementById(`compare`),
		action=document.querySelector(`figure>svg>path:last-of-type`),
		canvas=document.querySelector(`canvas`),
		context=canvas.getContext(`2d`),
		width=canvas.width,
		height=canvas.height,
		button=document.querySelector(`button`),
		a=document.createElement(`a`),
		xml=new XMLSerializer,
		image=new Image,
		draw=()=>image.src=URL.createObjectURL(new Blob([xml.serializeToString(svg)],{type:`image/svg+xml;charset=utf-8`})),
		keydown=event=>{
			document.body.classList.toggle(`ctrl`,event.ctrlKey);
			if(event.ctrlKey)
				switch(event.key){
/*					case`b`:
						inputs.name.focus();
						break;
					case`c`:
						inputs.colour.focus();
						break;
					case`p`:
						event.preventDefault();
						inputs.data.focus();
						break;*/
					case`s`:
						event.preventDefault();
						button.dispatchEvent(new Event(`click`));
						break;
				}
		},
		keyup=event=>document.body.classList.toggle(`ctrl`,event.ctrlKey),
		save=()=>{
			canvas.toBlob(blob=>{
				a.href=URL.createObjectURL(blob);
				a.download=text.file.firstChild.nodeValue+`.png`;
				document.body.append(a);
				a.click();
				a.remove();
				URL.revokeObjectURL(a.href);
			});
		},
		sanitise=value=>value.toLowerCase().replace(/\+/g,`plus`).replace(/^\./,`dot-`).replace(/\.$/,`-dot`).replace(/\./g,`-dot-`).replace(/^&/,`and-`).replace(/&$/,`-and`).replace(/&/g,`-and-`).replace(/[ !:’']/g, "").replace(/à|á|â|ã|ä/g,`a`).replace(/ç|č|ć/g,`c`).replace(/è|é|ê|ë/g,`e`).replace(/ì|í|î|ï/g,`i`).replace(/ñ|ň|ń/g,`n`).replace(/ò|ó|ô|õ|ö/g,`o`).replace(/š|ś/g,`s`).replace(/ù|ú|û|ü/g,`u`).replace(/ý|ÿ/g,`y`).replace(/ž|ź/g,`z`),
		setfill=hex=>parseInt(hex.substr(0,2),16)*.299+parseInt(hex.substr(2,2),16)*.587+parseInt(hex.substr(4,2),16)*.114<160?`#fff`:`#000`,
		generate=event=>{
			clearTimeout(timer);
			timer=setTimeout(()=>{
				target=event.target;
				value=target.value.trim();
				delay=0;
				switch(target){
					case inputs.colour:
						if(!inputs.overlay.value){
							if(!target.validity.valid)
								value=`111111`;
							value=value.replace(/^#/,``);
							text.color.parentNode.setAttribute(`fill-opacity`,target.validity.valid?`1`:`0`);
							if(target.validity.valid)
								text.color.textContent=value.toUpperCase();
							background.setAttribute(`fill`,`#`+value);
							svg.setAttribute(`fill`,setfill(value));
							delay=200;
						}
						break;
					case inputs.data:
						path.setAttribute(`d`,value);
						if(icon=data.find(([,d])=>d===value))
							if(icon=meta.find(d=>sanitise(d.title)===icon[0])){
								inputs.name.value=icon.title;
								setTimeout(()=>inputs.name.dispatchEvent(new Event(`input`)));
								inputs.colour.value=icon.hex;
								inputs.colour.dispatchEvent(new Event(`input`));
							}
						break;
					case inputs.overlay:
						compare.setAttribute(`fill-opacity`,value?`.5`:`0`);
						text.color.parentNode.setAttribute(`fill-opacity`,value||!inputs.colour.validity.valid?`0`:`1`);
						text.type.textContent=value?`Comparison`:`Preview`;
						if(value){
							background.setAttribute(`fill`,`#111111`);
							svg.setAttribute(`fill`,setfill(`111111`));
						}else inputs.colour.dispatchEvent(new Event(`input`));
						delay=value?0:200;
						break;
					case inputs.name:
						text.file.textContent=sanitise(value);
						text.brand.textContent=value;
						break;
					case inputs.action:
						value&&action.setAttribute(`d`,value);
						action.setAttribute(`fill-opacity`,value?1:0);
						delay=200;
						break;
				}
				timer=setTimeout(()=>{
					target===inputs.overlay&&compare.setAttribute(`d`,value);
					draw();
				},event.isTrusted*delay);
			},event.isTrusted*50);
		};
	let color,delay,icon,target,timer,value;
	document.getElementById(`count`).textContent=count.toString().replace(/\B(?=(\d{3})+(?!\d))/g,`,`);
	image.addEventListener(`load`,()=>{
		context.clearRect(0,0,width,height);
		context.drawImage(image,0,0);
		URL.revokeObjectURL(image.src);
	});
	draw();
	button.addEventListener(`click`,save);
	document.body.addEventListener(`keydown`,keydown);
	document.body.addEventListener(`keyup`,keyup);
	document.addEventListener(`input`,generate,true);
})();