/*  WS Questo script contiene tutto quello che riguarda il layout generale pannello centrale, pannello latera tab accordion
    -login / registrazione
*/


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Funzione che regola la maschera di LOGIN / REGISTRAZIONE
//////////////////////////////////////////////////////////////////////////////////////////////////////////
var outerLayout, canvasLayout, innerLayout; 

createLayout = function(){

		outerLayout = $('body').layout({ 
			center__paneSelector:	".outer-east" //contenitore canvas
		,	east__paneSelector:		".outer-center"  // contenitore strumenti
		,	east__size:				420            // larghezza contenitore strumenti
		,	east__minSize:			420
		,	spacing_open:			8 // ALL panes
		,	spacing_closed:			10 // ALL panes
		,	center__onresize:		"canvasLayout.resizeAll" 
		}); 

		canvasLayout = $('div.outer-center').layout({ 
			center__paneSelector:	".middle-center" // contiene il canvas primario e secondario interno (non usato)
		,	east__paneSelector:		".middle-east" // contiene il canvas secondario esterno (usato)
		,	spacing_open:			8  // ALL panes
		,	spacing_closed:			10 // ALL panes
		,	center__onresize:		"innerLayout.resizeAll" 
		}); 

		innerLayout = $('div.middle-center').layout({ 
			center__paneSelector:	".inner-center"// contiene il canvas vero e prorio 
		,	east__paneSelector:		".inner-east"  // contiene il canvas secondario interno (facoltativo)
//		,	east__size:				0 
		,	center__size:			'auto' 
		,	north__size:			70
		,	spacing_open:			0  // ALL panes
		,	spacing_closed:			0  // ALL panes
		,	east__spacing_open:	    12
		,	east__spacing_closed:	12
		});
		
		  $( "#accordion" ).accordion({
			  heightStyle: "fill",
			  activate: function( event, ui ) {
			  	  accordionChanged(ui.newPanel.attr('id').replace(/ui-accordion-accordion-panel-/,''));
			  }
		   });
		  $( ".tabs" ).tabs({
		  	  activate: function( event, ui ) {
			  	  tabChanged(ui.newPanel.attr('id'));
			  },
			  disabled: [ 1, 2, 3 ]
		   });
		
	$(".ui-state-disabled").click(showRegisterReminderWindow);   
}

$(window).resize(function(){
    $("#accordion").accordion("refresh");
});