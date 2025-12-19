/**
 * @file
 * Product Calculator for Drupal 10/11.
 */
(function ($, Drupal, once) {
  Drupal.behaviors.productCalculator = {
    attach: function (context, settings) {
      
      var onceId = 'product-calculator-behavior';

      // ==========================================
      // PART 1: CLIENT NAME TO TITLE SYNC
      // ==========================================
      
      var $mainTitleWrapper = $('.field--name-title, .js-form-item-title-0-value').first(); 
      var $mainTitleInput = $('input[name="title[0][value]"]');

      // 1. Hide Title & Remove Required
      $mainTitleWrapper.hide();
      $mainTitleInput.removeAttr('required');

      // 2. Sync Logic
      function syncClientTitle() {
        // Look specifically for the Client Information table
        var $clientTable = $('#ief-entity-table-edit-field-client-information-entities');
        
        // Find the first row in the body
        var $firstRow = $clientTable.find('tbody tr').first();
        
        if ($firstRow.length > 0) {
          // Try to find the label class
          var $labelCell = $firstRow.find('.inline-entity-form-node-label');
          
          // If class not found, grab the first column text
          if ($labelCell.length === 0) {
             $labelCell = $firstRow.find('td').first();
          }

          var clientName = $labelCell.text().trim();

          // Update title if name exists and is different
          if (clientName && clientName.length > 0 && $mainTitleInput.val() !== clientName) {
            $mainTitleInput.val(clientName);
          }
        }
      }

      // 3. Trigger Sync Immediately
      syncClientTitle();

      // 4. Fallback on Submit
      var $submitBtn = $('#edit-submit');
      var $processedBtn = $(once('title-fallback', $submitBtn));

      $processedBtn.on('click', function() {
          syncClientTitle();
          
          // If completely empty, use date fallback
          if ($mainTitleInput.val() === '') {
              $mainTitleInput.val('Selection - ' + new Date().toLocaleDateString());
          }
      });


      // ==========================================
      // PART 2: PRODUCT CALCULATOR
      // ==========================================

      $('input[name^="field_grand_total"]').prop('readonly', true);

      var $wrappers = $(context).find('.ief-form');
      var $newWrappers = $(once(onceId, $wrappers));

      $newWrappers.each(function () {
        var $wrapper = $(this);
        
        // Lock fields
        $wrapper.find('input[name*="[field_price_per_piece]"]').prop('readonly', true);
        $wrapper.find('input[name*="[field_total]"]').prop('readonly', true);

        var $inputs = $wrapper.find(
          'input[name*="[field_mrp]"], ' + 
          'input[name*="[field_quantity]"], ' + 
          'input[name*="[field_discount_value]"], ' +
          'select[name*="[field_discount_type]"]'
        );

        $inputs.on('keyup change blur', function () {
          calculateRowTotal($wrapper);
        });
      });

      // ==========================================
      // PART 3: ALWAYS CALCULATE GRAND TOTAL
      // ==========================================
      
      // This runs every time the behavior attaches (including after AJAX)
      setTimeout(function() {
        calculateGrandTotal();
      }, 150);

      // ==========================================
      // PART 4: RECALCULATE ON CREATE/UPDATE BUTTON
      // ==========================================
      
      // Only attach these handlers once to avoid duplicates
      var $createButtons = $('input[name^="ief-add-submit-field_product"]');
      var $processedCreateBtns = $(once('create-recalc', $createButtons));
      
      $processedCreateBtns.on('mousedown', function(e) {
        recalculateAllForms();
      });

      var $updateButtons = $('input[name^="ief-edit-submit-field_product"]');
      var $processedUpdateBtns = $(once('update-recalc', $updateButtons));
      
      $processedUpdateBtns.on('mousedown', function(e) {
        recalculateAllForms();
      });


      // --- HELPER FUNCTIONS ---

      function recalculateAllForms() {
        // Find all visible product forms and recalculate them
        $('.ief-form:visible').each(function() {
          var $form = $(this);
          
          // Check if this form has product fields
          if ($form.find('input[name*="[field_mrp]"]').length > 0) {
            calculateRowTotal($form);
          }
        });
        
        // Update grand total
        calculateGrandTotal();
      }

      function calculateRowTotal($wrapper) {
        var $mrpField   = $wrapper.find('input[name*="[field_mrp]"]');
        var $qtyField   = $wrapper.find('input[name*="[field_quantity]"]');
        var $discVal    = $wrapper.find('input[name*="[field_discount_value]"]');
        var $discType   = $wrapper.find('select[name*="[field_discount_type]"]');
        
        var $pricePerPiece = $wrapper.find('input[name*="[field_price_per_piece]"]');
        var $totalField    = $wrapper.find('input[name*="[field_total]"]');

        // Make sure we found the fields
        if ($mrpField.length === 0 || $qtyField.length === 0) {
          return; // Skip if fields not found
        }

        var mrp   = parseFloat($mrpField.val()) || 0;
        var qty   = parseFloat($qtyField.val()) || 0;
        var dVal  = parseFloat($discVal.val())  || 0;
        var dType = $discType.val(); 

        var discountAmount = 0;
        if (dType == '6') { 
          discountAmount = mrp * (dVal / 100);
        } else if (dType == '7') { 
          discountAmount = dVal;
        }

        var finalPricePerPiece = Math.max(0, mrp - discountAmount);
        var finalTotal = finalPricePerPiece * qty;

        $pricePerPiece.val(finalPricePerPiece.toFixed(2));
        $totalField.val(finalTotal.toFixed(2));

        calculateGrandTotal();
      }

      function calculateGrandTotal() {
        var grandTotal = 0;
        
        // Try multiple selectors to find the product table
        var $prodTable = $('#ief-entity-table-edit-field-product-entities');
        
        // Fallback: search for any table with product entities
        if ($prodTable.length === 0) {
          $prodTable = $('table[id*="field-product-entities"]').first();
        }
        
        // Fallback: search by class
        if ($prodTable.length === 0) {
          $prodTable = $('.field--name-field-product table.ief-entity-table').first();
        }
        
        if ($prodTable.length > 0) {
          $prodTable.find('tbody tr').each(function() {
            var $row = $(this);
            
            // Skip rows that are being edited or contain forms
            if ($row.hasClass('ief-row-editing') || 
                $row.hasClass('ief-row-form') || 
                $row.hasClass('ief-row-entity-form') || 
                $row.css('display') === 'none') {
              return; // Skip this row
            }

            // Only process regular entity rows
            if ($row.hasClass('ief-row-entity')) {
              // Try multiple selectors to find total cell
              var $totalCell = $row.find('.inline-entity-form-node-field_total');
              if ($totalCell.length === 0) $totalCell = $row.find('.field--name-field-total');
              if ($totalCell.length === 0) $totalCell = $row.find('.views-field-field-total');
              if ($totalCell.length === 0) $totalCell = $row.find('td').eq(1); // Second column as fallback

              if ($totalCell.length > 0) {
                var textVal = $totalCell.text().trim().replace(/[^0-9.-]+/g,"");
                var rowTotal = parseFloat(textVal) || 0;
                if (rowTotal > 0) {
                  grandTotal += rowTotal;
                }
              }
            }
          });
        }

        // Active Forms - Add totals from all visible product forms
        $('.ief-form:visible').each(function() {
          var $form = $(this);
          var $activeTotalInput = $form.find('input[name*="[field_total]"]');
          
          if ($activeTotalInput.length > 0 && $activeTotalInput.is(':visible')) {
            var formTotal = parseFloat($activeTotalInput.val()) || 0;
            if (formTotal > 0) {
              grandTotal += formTotal;
            }
          }
        });

        // Update Grand Total
        var $grandTotalField = $('input[name^="field_grand_total"]');
        if ($grandTotalField.length > 0) {
          $grandTotalField.val(grandTotal.toFixed(2));
        }
      }

    }
  };

})(jQuery, Drupal, once);