	
	
	function htmlEncode(value){
	  return $('<div/>').text(value).html();
	}

	function htmlDecode(value){
	  return $('<div/>').html(value).text();
	}

	function SelectText(element) {
	    var doc = document;
	    var text = doc.getElementById(element);    
	    if (doc.body.createTextRange) {
	        var range = document.body.createTextRange();
	        range.moveToElementText(text);
	        range.select();
	    } else if (window.getSelection) {
	        var selection = window.getSelection();        
	        var range = document.createRange();
	        range.selectNodeContents(text);
	        selection.removeAllRanges();
	        selection.addRange(range);
	    }
	}

	$(document).ready(function(){

		if($("#"+window.location.hash.replace("#","")).length == 1){
			$("[data-section = 'true']").hide();
			obj.switchSection(window.location.hash.replace("#",""));
		}
		$("[data-sectionswitch]").click(function(e){
			obj.switchSection($(this).data("sectionswitch"));
			window.location.hash = $(this).data("sectionswitch");
			return false;
		});
		$("[data-modal-open]").click(function(){
			$("#"+$(this).data("modal-open")).modal("show");
			return false;
		});
		

		
		//grabbing code pieces to show later on	
		var codePieces = new Array();
		$("[data-getcode]").each(function(index){
			codePieces[$(this).attr("data-getcode")] = $("#"+$(this).attr("data-getcode")).html();							
		});	
			

		
		$("[data-getcode]").click(function(e){
			$(this).attr("title","Click to get code");
		
			codeToShow = $.trim(htmlEncode(codePieces[$(this).data("getcode")])).replace(/\t/g, ' ');
			$("#codeModal pre.prettyprint").html("<code>"+codeToShow+"</code>");
			prettyPrint();
			$("#codeModal").modal("show");
			
			
		});
		
		//parse components
		$("[data-component]").each(function(){
			
			if(window["components"][$(this).data("component")]){
				window["components"][$(this).data("component")]($(this)); // succeeds
			}
			
		});
		
		$("#selectAll").click(function(){
			//$(".prettyprint").select();
			SelectText("prettyprint");
		});
		
		
		prettyPrint();

	});
	
	components = ({
		dropdown: function(el){
			el.chosen().change(function(){
				//if we have some options grouped under an optgroup,
				// display the optgroup label name on the selected result
				if($(this).find("option:selected").parent().is("optgroup")){
					var group_label = $(this).find("option:selected").parent().attr("label");
					var component_label = $("#"+$(this).attr("id")+"_chzn").find("a:first span");
					component_label.html("<strong>"+group_label+":</strong> "+$(this).find("option:selected").text());
				}

				//for quiet selectors, remove active state after the user selects something
				if($(el).attr("data-component-dropdown-mode") == "quiet"){
					$("#"+$(el).attr("id")+"_chzn").removeClass("chzn-container-active");
				}

				
			});
			$("#"+$(el).attr("id")+"_chzn").find("li.group-option").click(function(){
			//trigger the change event for the options under optgroup
			//so that we could display the optgroup label name even if the user
			//selects the same options (the selected one)				
				$(el).trigger("change");
			});

			//quiet selector
			if($(el).attr("data-component-dropdown-mode") == "quiet"){
				$("#"+$(el).attr("id")+"_chzn").addClass("quiet");
			}
			
			if($(el).attr("data-component-dropdown-mode") == "quiet"){
				
				//for quiet selectors, remove active state after the user selects something
				$("#"+$(el).attr("id")+"_chzn .active-result").click(function(){
					$("#"+$(el).attr("id")+"_chzn").removeClass("chzn-container-active");

				});
				
				//add active state on hover
				$("#"+$(el).attr("id")+"_chzn .chzn-single").hover(
					function(){
						$("#"+$(el).attr("id")+"_chzn").addClass("chzn-container-active");
						
					},
					function(){

						if($(this).hasClass("chzn-single-with-drop") == false){
							$("#"+$(el).attr("id")+"_chzn").removeClass("chzn-container-active");
						}
							
							
						
					}
				);
				
				
			}
			//no search field
			if($(el).attr("data-component-dropdown-search") == "disabled"){
				$("#"+$(el).attr("id")+"_chzn .chzn-search").hide();	
			}
			

		},
		popover: function(el){



			el.popover({
				"trigger":el.data("popover-trigger"),
				"content":el.data("popover-content"),
				"title":el.attr("title") || el.data("popover-title"),
				"placement":el.data("popover-placement"),
			});

			//addinch click behaviour for the component
			if(el.data("popover-trigger") == "click"){

				$(el).click(function(e){
					
					$(this).popover("show");
					

					$(".popover").click(function(e){
						e.stopPropagation();
					});
					e.preventDefault();
					e.stopPropagation();
				});
			}
			if(el.data("popover-trigger") == "focus"){
				$(el).bind("focus click",function(e){

					e.stopPropagation();
					e.preventDefault();
				});
			}
			
			$("body").bind("click.popover",function(){
				$(".popover").hide();
			});
	
		},
		sidebar: function(el){
			
			var sidebar_container = $('<div class="modal nonfloating sidebar"/>');
			sidebar_container.insertAfter(el);
			var accordeon_id = $(el).attr("id");
			$(el).attr("id","old_"+$(el).attr("id"));
			var accordion_container = $('<div class="accordion" id="'+accordeon_id+'"/>');
			accordion_container.appendTo(sidebar_container);
			//first level
			$(el).children("li").each(function(index){
				var heading = $('<div class="accordion-group"><div class="accordion-heading"><a data-toggle="collapse" data-parent="'+accordeon_id+'" class="accordion-toggle" href="#collapse'+index+'"></a></div></div>');
				heading.appendTo(accordion_container);
				heading.find(".accordion-toggle").html($(this).children("a").html());
				if($(this).children("a").hasClass("active")){
					heading.find(".accordion-toggle").addClass("active");
				 	heading.find(".accordion-toggle").find("i").addClass("icon-white");
				}
				//second level
				if($(this).find("ul").length>0){
					var second_level = $(' <div id="collapse'+index+'" class="accordion-body collapse" style="height: 0"><div class="accordion-inner"></div></div');
					second_level.insertAfter(heading.children(".accordion-heading"));
					second_level.find(".accordion-inner").html("<ul>"+$(this).children("ul").html()+"</ul>");
				}
				if($(this).children("a").hasClass("active")){
					heading.find(".accordion-body").addClass("in");
					heading.find(".accordion-body").css("height","auto");
				}
				
			});
			//removing the original UL
			$(el).remove();
			
			//adding active class to the clicked subitem
		  	$("#"+accordeon_id).click(function(){
		  		$(".sidebar ul a").removeClass("active");
		  		$(this).toggleClass("active");
		  	});
			//removing active class from former active sidebar element
			$("#"+accordeon_id).on('show', function () {
				$(this).find(".active").removeClass("active");
			  	$(this).find(".icon-white").removeClass("icon-white");
			});
		
			//activate accordion
			//$("div#"+accordeon_id).collapse();
		},
		collapsible_divider: function(el){
			
			
			$(el).click(function (e) {
				if($(this).find(".heading i").hasClass("icon-chevron-down")){
					$(this).find(".heading i").removeClass().addClass("icon-chevron-up")
				}
				else{
					$(this).find(".heading i").removeClass().addClass("icon-chevron-down")
				}
			});
		},
		filters: function(el){
			
			var curent_filters = {};

			$(el).find(".curent_filters .close").live("click",function(e){
				removeFilter(e);
				e.preventDefault();
			});
			$(el).find("[data-reset-filters='true']").hide();
			$(el).find("[data-reset-filters='true']").click(function(e){
				clearFilters();
				e.preventDefault();
			});

			$(el).find("[data-apply-filters='true']").click(function(e){
				$(el).find(".curent_filters").remove();
				parseFilters();
				e.preventDefault();
			});

			$("body").bind("click.filters",function(){
				$(".filterpanel",el).addClass("invisible");
			});

			$(el).find("[data-dismiss='modal']").click(function(e){
				$(this).closest(".filterpanel").addClass("invisible");
				e.preventDefault();
			});

			$(el).find(".filterpanel").click(function(e){
					e.stopPropagation();
			});
			
			$(el).find(".filterpanel form [data-component-filter-element]").change(function(){
				$(el).find(".filterpanel form").attr("data-changed","true");
			});

			$(el).find(".trigger").click(function(e){
				//show reset button if we have filters
				if($(".curent_filters",el).length > 0){
					$(el).find("[data-reset-filters='true']").show();	
				}
				$(el).find(".filterpanel").toggleClass("invisible");
				$(el).find(".filterpanel form").attr("data-changed","false");
				e.stopPropagation();
				e.preventDefault();
			});
			$(el).find(".filterpanel form").submit(function(){
				
				$(el).find(".curent_filters").remove();
				parseFilters();
				e.preventDefault();
			});
			
			var clearFilters = function(){
				
				
				$(el).find(".filterpanel form").attr("data-changed","false");
				$(el).find("[data-component-filter-element]").each(function(){
					switch($(this).attr("type")) {
			            case 'password':
						case 'select':
			            case 'text':
            			case 'textarea':
			                $(this).val('');
		                break;
			            case 'checkbox':
			            case 'radio':
			                this.checked = false;
			        }
			        if($(this).is("select")){
			        	$(this).val('');
			        	//in case we have a chosen component
			        	$(this).trigger("liszt:updated");
			        }
				});
				$(el).find(".filterpanel").addClass("invisible");
				if($(el).find(".curent_filters").length > 0){
					$(el).find(".curent_filters").remove();
					curent_filters = {};
   					$(el).trigger("filterChange",curent_filters);
				}
				
			}
			var parseFilters = function(){
				
				$(el).find(".filterpanel").addClass("invisible");
				var filterList = $('<ul class="curent_filters"/>');

				$(el).find("[data-component-filter-label]").each(function(){
					var filter_label = $(this).data("component-filter-label");
					var filter_value = "";
					var filter_element = $(this).find("[data-component-filter-element]:first").first();
					
					if(filter_element.is("select")){
						filter_value = filter_element.val();
					}
					else if(filter_element.attr("type") == "radio"){
						//get checked element
						el_name = filter_element.attr("name");
						filter_value = $("input[name='"+el_name+"']:checked",$(this)).val();
					}
					else if(filter_element.attr("type") == "checkbox"){
						//get checked element
						el_name = filter_element.attr("name");
						$("input[name='"+el_name+"']:checked",$(this)).each(function(){
							filter_value += $(this).val()+",";
						});
						filter_value = filter_value.slice(0,filter_value.length-1);
					}
					else{
						filter_value = filter_element.val();
					}
					
					//adding curent filter list

					if(filter_label != null && filter_value != null && filter_value != "" && typeof(filter_value)!="undefined"){
						filter_value = String(filter_value).replace(",",", ");
						curent_filters[filter_label] = filter_value;
						$('<li data-component-filter-label = "'+filter_label+'"><label class="filter_name">'+filter_label+': </label><label class="filter_value">'+filter_value+'</label><button class="close">&times;</a></li>').appendTo(filterList);
						filterList.insertAfter($(el).find(".heading"));
					}
				});

				//trigger filterChange event only if the form has changed
				if($(".curent_filters",el).length!=0 && $(".filterpanel form",el).attr("data-changed") == "true"){

					$(el).trigger("filterChange",curent_filters);	
				}
				
				

				
			}
			var removeFilter = function(e){
				filter_label = $(e.target).closest("li").data("component-filter-label");
				//reset filters form for the coresponent filter label
				filter_parent_group = $(".filterpanel",el).find("[data-component-filter-label = '"+filter_label+"']");
				filter_parent_group.find("[data-component-filter-element]").each(function(){
					 switch($(this).attr("type")) {
			            case 'password':
						case 'select':
			            case 'text':
            			case 'textarea':
			                $(this).val('');
		                break;
			            case 'checkbox':
			            case 'radio':
			                this.checked = false;
			        }
			        if($(this).is("select")){
			        	$(this).val('');
			        	//in case we have a chosen component
			        	$(this).trigger("liszt:updated");
			        }

				});
				$(e.target).closest("li").fadeOut("slow",function(){
					$(this).remove();
				});
				$(el).trigger("filterChange",curent_filters);

			}

		},
		hint: function(el){
			var icon = $(el).closest(".hint_container").find(".icon");
			

			if($(el).attr("data-component-hint-trigger") == "focus"){
				$(el).bind("click focus",function(e){
					$(".popover").hide();
					icon.popover("show");
					e.stopPropagation();
				});	
				$(el).bind("blur",function(e){
				
					icon.popover("hide");
					e.stopPropagation();
				});
			}
			
			
			icon.click(function(e){
				$(".popover").hide();
				$(this).popover("show");
				e.stopPropagation();
			});

			if($(el).attr("data-component-hint-visible") == "true"){
				console.log("show damn popover");
				icon.popover("toggle");

			}
			
		}
	});
	
	



	obj = ({
	openModal: function(e){
		$("#myModal").modal("show");
		return false;
	},

	switchSection : function(sectionName){
		$("#navbar li").removeClass("active");
		$("[data-section = 'true']").hide();

		$("#"+sectionName+"[data-section = 'true']").show();
		//$($(e.target).closest("li").addClass("active"));
		$("#navbar a[data-sectionswitch='"+sectionName+"']").closest("li").addClass("active");
		
		return false;
	}
});