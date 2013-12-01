/*addEvent: an immediately invoked function 
*           do detect browser event handler 
*           on the first execution.
*         returns: corresponding event listener attached
*                  to the element       
*/
var addEvent = function(document){
	if(document.addEventListener){
		return function(element,eventType,callBack){
			element.addEventListener(eventType,callBack,false);
		}
	}else if(document.attachEvent){

		return function(element,eventType,callBack){
			element.attachEvent('on'+eventType,function(){return callBack.call(element)});
		}
		}
	}(document)

/*ShoeFBPAges: Immediately Invoked Function 
*/

var ShowFBPAges = (function(){
	
	var lookUpFavourites={};
	 if (!localStorage.favouriteData){
	 	
	 	localStorage.favouriteData= "[]";
	 }else if(Object.prototype.toString.call(JSON.parse(localStorage.favouriteData))!=="[object Array]"){
	 	
	 	localStorage.favouriteData= "[]";
	 }
						
	var mainLoadImage = document.createElement("img");
		mainLoadImage.src="main-loader.gif";
		mainLoadImage.setAttribute("class","loadOuter");
	var errorElement = document.createElement("div");
		errorElement.setAttribute("class","error");
	var	manageFavourites = new ManageFavourites();


	/**
	* ajaxGetRequest : fires AJAX Get request 
	* calls the 'callBack' function passing xmlHttp object
	* and a boolean to represent success or error  
	*/
	var ajaxGetRequest = function(url,callBack){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = readyStateCallback;  
		          
		        function readyStateCallback() {  

		            if(xhr.readyState < 4) {  
		                return;  
		            }  
		              
		              
		            if(xhr.status == 400){

		            	callBack(xhr,false);
		            }
		  
		             
		            if(xhr.readyState === 4 && xhr.status == 200) {  

		                callBack(xhr,true);


		            }             
		        }  
		          
		        xhr.open('GET', url, true);  
		        xhr.send('');  
	}
	/*****
	Class: ShowResult
	properties:  
	resultListNode :: reference of the DOM node 
					  where result will be populated
	data :: has the received xmlhttp responsetext
	methods:
	  sortData:: sorts the object array based on object name in descending order
	  displayList :: displays the search result and attaches event to more Info link
	  moreInfo:: AJAX request for page details
	  displayMoreInfo:: displays the fetched result for more info


	****/

	function ShowResult(resultNode){
		this.resultListNode = resultNode;
		var that = this; 
		this.data = [];
		this.sortData = function(){
			this.data.sort(function(a,b){
				name1= a.name.toLowerCase();
				name2 = b.name.toLowerCase();
				if(name1 < name2){
					return 1;
				}else{
					return name1>name2?-1:0;
				}
			});
			
		};
		/*making the data locally scoped to the function
		*for faster access*/
		this.displayList = function(xhr){
			var JSONobj=JSON.parse(xhr.responseText);
			this.data= JSONobj.data;
			
			this.sortData();
			var ParentNode = this.resultListNode; 
			
			
			var data = this.data;                         
			var ulNode = document.createElement("ul");

			for(i=0,len=data.length;i<len;i++){
				var liNode = document.createElement("li");
				var linkContainer = document.createElement("div");
				var alreadyInFavourites = lookUpFavourites[data[i].id];
				linkContainer.setAttribute("class","linkContainer");
				var moreInfolink=document.createElement("a");
				var favourite=document.createElement("a");
				var divClear = document.createElement("div");
				divClear.setAttribute("class","clear");

				moreInfolink.id = data[i].id;
				moreInfolink.setAttribute("class","mf");
				moreInfolink.innerHTML="more info";

				//check if already present in lookup table

				if(alreadyInFavourites && (alreadyInFavourites==data[i].id)){
					favourite.setAttribute("class","fav selected");
				}else{
					favourite.setAttribute("class","fav");
				}
				
				favourite.innerHTML="my favourite";
				favourite.setAttribute("data-position",i);
				favourite.setAttribute("data-id",data[i].id);

				addEvent(moreInfolink,'click',this.moreInfo/*this.moreInfo.bind(this)*/);
				addEvent(favourite,'click',this.favourites);
				
				liNode.innerHTML= data[i].name;
				linkContainer.appendChild(favourite);
				linkContainer.appendChild(moreInfolink);
				linkContainer.appendChild(divClear);
				liNode.appendChild(linkContainer);

				ulNode.appendChild(liNode);
			}
			ParentNode.appendChild(ulNode);


		}
		this.favourites =function(){
			var pageID = this.getAttribute("data-id");
			var data_position = this.getAttribute("data-position");
			var favData = that.data[data_position];
			var url ="https://graph.facebook.com/"+pageID;
			this.setAttribute("class","fav selected");
			ajaxGetRequest(url,function(xhr,success){
				if(success){
				//add entry into lookup table
				lookUpFavourites[pageID]=pageID;	
				manageFavourites.addToFavourite(xhr);
			}else{
				this.setAttribute("class","fav");
				alert("Server Problem. Try later!");

			}
			});

			

			
		};
		this.moreInfo = function(){
			var pageID = this.id;
			var url ="https://graph.facebook.com/"+pageID;
			var anchorElement = this;
			var parentofAnchor=anchorElement.parentNode;
			var existingElement=parentofAnchor.parentNode.childNodes[2];
			var tag = anchorElement.innerHTML;
			if(tag=="less info"){
				existingElement?parentofAnchor.parentNode.removeChild(existingElement):1;
				anchorElement.innerHTML="more info";
			}else if(tag=="more info"){

				var sectionElement = document.createElement("section");
				
				
				sectionElement.setAttribute("class","moreInfo");
				var innerLoadImage = document.createElement("img");
					innerLoadImage.src="ajax_loader.gif";
					innerLoadImage.setAttribute("class","loadInner");

				var errorInnerElement = document.createElement("div");
					errorInnerElement.setAttribute("class","error");
				
				sectionElement.appendChild(innerLoadImage);
				
				existingElement?parentofAnchor.parentNode.removeChild(existingElement):1;
				
				insertAfter(parentofAnchor,sectionElement);
				anchorElement.innerHTML="less info";
				ajaxGetRequest(url,function(xhr,success){
					if(success){
					that.displayMoreInfo(sectionElement,innerLoadImage,xhr);
				}else{
					var JSONobj = JSON.parse(xhr.responseText);
					innerLoadImage.style.display="none";
					errorInnerElement.innerHTML=JSONobj.error.message;
					sectionElement.appendChild(errorInnerElement);
				}
				});

			}
			

		};
		this.displayMoreInfo = function(sectionElement,innerLoadImage,xhr){

			
			var divElement = document.createElement("div");
			
			var imageElement = document.createElement("img");
			var headerElement= document.createElement("header");
			var divClear = document.createElement("div");
			divElement.setAttribute("class","detail");
			divClear.setAttribute("class","clear");

			innerLoadImage.style.display="none";

			var JSONobj=JSON.parse(xhr.responseText);
			var name =  "<span>name    :  "+JSONobj.name+"</span>";
			var likes=  "<span>likes   :  "+JSONobj.likes+"</span>";
			var website="<span>website :  <a href="+JSONobj.website+">"+JSONobj.website+"</a></span>";
			var link=   "<span>link    :  <a href="+JSONobj.link+">"+JSONobj.link+"</a></span>";
			divElement.innerHTML=name+likes+website+link;

			imageElement.setAttribute("class","dispimage");
			if(JSONobj.cover){
			imageElement.setAttribute('src', JSONobj.cover.source);
			}
			headerElement.innerHTML=JSONobj.about;
			sectionElement.appendChild(headerElement);

			sectionElement.appendChild(divElement);
			sectionElement.appendChild(imageElement);
			sectionElement.appendChild(divClear);


			

		}
		
		
	}

	/*insertAfter: utility function to insert a new node after a reference
	*			node
	*/

	function insertAfter(referenceNode, newNode) {
	    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}

	/*class: ManageFavourites-(manages user favourites)  
		properties:
			parentElem: holds reference to favourites div element
			favouriteData: conatains the persisted user favourite data
		methods:
		addToFavourite: adds a user favourite to the list
		removeFromFavourite: removes a user favourite from list
		showAllFavourite: populates all the user favourite in DOM.

	*/
	function ManageFavourites() {

		
		var that = this;
		this.parentElem = "";
		this.favouriteData = JSON.parse(localStorage.favouriteData);
		this.persist= function(){
			localStorage.favouriteData = JSON.stringify(this.favouriteData);
		}
		this.addToFavourite=function(data){
				
				var dataObj = JSON.parse(data.responseText);
			 for (var i = 0, len = this.favouriteData && this.favouriteData.length; i < len; i++) {
			     
			     if (this.favouriteData[i]["id"] == dataObj.id){
			     	
			     	break;
			     }
			 }
			 if(i==len){
			 	this.favouriteData.push(dataObj);
			 	this.persist();
			 
			 var parentNode = document.getElementById(this.parentElem);
			// console.log(parentNode.childNodes[3]);
			 var liNode = document.createElement("li");
			 var linkContainer = document.createElement("div");
			 var ulNode = parentNode.childNodes[3] || document.createElement("ul");
			// console.log("fdd  ::"+ulNode.innerHTML);
			 var unfavlink=document.createElement("a");
			 
			 var divClear = document.createElement("div");
			 divClear.setAttribute("class","clear");

			 unfavlink.id = dataObj.id;
			 unfavlink.setAttribute("class","mf");
			 unfavlink.innerHTML="unfavourite";
			 
			 var spanAnchor="<a href="+dataObj.link+">"+dataObj.name+"</a>";
			 addEvent(unfavlink,'click',this.removeFromFavourite/*this.moreInfo.bind(this)*/);
			 
			 
			 liNode.innerHTML= spanAnchor;
			 
			 linkContainer.appendChild(unfavlink);
			 linkContainer.appendChild(divClear);
			 liNode.appendChild(linkContainer);

			 ulNode.appendChild(liNode);
			 parentNode.appendChild(ulNode);
			 }




			 
		}
		this.removeFromFavourite=function(){
			var id = this.id;
			var parentLiNode = this.parentNode.parentNode;
			var ulNode = parentLiNode.parentNode;
			for (var i = 0, len = that.favouriteData.length; i < len; i++) {
			    
			    if (that.favouriteData[i]["id"] == id){
			    	break;
			    }
			}
			if(i!==len){
				delete lookUpFavourites[id];
				that.favouriteData.splice(i,1);
				that.persist();
			}
			ulNode.removeChild(parentLiNode);


		}
		this.showAllFavourite=function(){
				var data = this.favouriteData;
				var parentNode = document.getElementById(this.parentElem);
				var favouriteSpan = parentNode.childNodes[1];
				addEvent(favouriteSpan,'click',function(){
					var classString = this.parentNode.getAttribute("class");
					
					if(classString.indexOf("show")==-1){
					
					classString =classString.replace(/hide/,"show");
					}else{

						classString = classString.replace(/show/,"hide");
					}
					
				this.parentNode.setAttribute("class",classString);	

				});
				
				
					var ulNode = document.createElement("ul");
				for(i=0,len=data&&data.length;i<len;i++){
					var liNode = document.createElement("li");
					var linkContainer = document.createElement("div");
					
					var unfavlink=document.createElement("a");
					
					var divClear = document.createElement("div");
					divClear.setAttribute("class","clear");

					unfavlink.id = data[i].id;
					//adding entries to lookup tabe using persisted data
					lookUpFavourites[data[i].id]= data[i].id;

					unfavlink.setAttribute("class","mf");
					unfavlink.innerHTML="unfavourite";
					
					var spanAnchor="<a href="+data[i].link+">"+data[i].name+"</a>";
					addEvent(unfavlink,'click',this.removeFromFavourite/*this.moreInfo.bind(this)*/);
					
					
					liNode.innerHTML= spanAnchor;
					
					linkContainer.appendChild(unfavlink);
					linkContainer.appendChild(divClear);
					liNode.appendChild(linkContainer);

					ulNode.appendChild(liNode);
				}
				

				//console.log(lookUpFavourites);
				parentNode.appendChild(ulNode);

		}

	}

	/*
		anonymous function returned for IIFE ShowFBPAges
	*/
	return function(searchField,searchButton,resultList,favouriteId,authKey){
			var authorization = authKey;
			var searchFieldInput = document.getElementById(searchField);
			var searchButton = document.getElementById(searchButton);
			var resultNode = document.getElementById(resultList);

			manageFavourites.parentElem = favouriteId;
			manageFavourites.showAllFavourite();
			//addEvent(searchButton,'click',function(){alert("clicked");})
			
			
			var showResult = new ShowResult(resultNode);
			addEvent(searchButton,'click',function(){
					var searchValue = searchFieldInput.value;
					resultNode.innerHTML="";
					var url = "https://graph.facebook.com/search?limit=5000&q="+encodeURIComponent(searchValue)+"&type=page&access_token="+authKey;
					resultNode.appendChild(mainLoadImage);
				ajaxGetRequest(url,function(xhr,success){
					resultNode.removeChild(mainLoadImage);
					if(success){
					
					showResult.displayList(xhr);
					}else{
					var JSONobj = JSON.parse(xhr.responseText);
					errorElement.innerHTML=JSONobj.error.message;
					resultNode.appendChild(errorElement);
					}


				});})


			




	}

})()