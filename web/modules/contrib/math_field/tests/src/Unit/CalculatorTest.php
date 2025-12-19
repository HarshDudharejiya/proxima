<?php

namespace Drupal\Tests\math_field\Unit;

use Drupal\math_field\Calculator;
use Drupal\Tests\UnitTestCase;

/**
 * Tests to ensure that asserts pass.
 *
 * @group math_field
 */
class CalculatorTest extends UnitTestCase {
  /**
   * The calculator service.
   *
   * @var \Drupal\math_field\CalculatorInterface
   *   The calculator service used for mathematical calculations.
   */
  protected $calculator;

  /**
   * Before a test method is run, setUp() is invoked.
   *
   * Create the required objects.
   */
  public function setUp(): void {
    parent::setUp();
    $this->calculator = new Calculator();
  }

  /**
   * @covers Drupal\math_field\Calculator::lexer
   * @dataProvider lexerDataProvider
   */
  public function testLexer($expression, $expectedPostfix) {
    $result = $this->calculator->lexer($expression);
    $this->assertEquals($result, $expectedPostfix);
  }

  /**
   * Lexer data provider.
   *
   * @return array
   *   Return lexer data.
   */
  public function lexerDataProvider() {
    return [
      ['1 + 2', '1 2 +'],
      ['(2 + 3) * 5', '2 3 + 5 *'],
      ['((15 / (7 - (1 + 1))) * 3) - (2 + (1 + 1))', '15 7 1 1 + 
      - / 3 * 2 1 1 + + -',
      ],
      ['1.1 + 2', '1.1 2 +'],
      ['(1+2.1) * 33 + 200 / 10 +  100', '1 2.1 + 33 * 200 10 / + 100 +'],
    ];
  }

  /**
   * @covers Drupal\math_field\Calculator::evaluate
   * @dataProvider evaluateDataProvider
   */
  public function testEvaluate($postfix, $expectedResult) {
    $result = $this->calculator->evaluate($postfix);
    $this->assertEquals($result, $expectedResult);
  }

  /**
   * Evaluate data provider.
   *
   * @return array
   *   Return the evaluate data.
   */
  public function evaluateDataProvider() {
    return [
      ['1 2 +', '3'],
      ['2 3 + 5 *', '25'],
      ['15 7 1 1 + - / 3 * 2 1 1 + + -', '5'],
      ['1.1 2 +', '3.1'],
      ['1 2.1 + 33 * 200 10 / + 100 +', '222.3'],
    ];
  }

  /**
   * Once test method has finished running.
   *
   * Whether it succeeded or failed, tearDown() will be invoked.
   * Unset the objects created on setUp.
   */
  public function tearDown(): void {
    parent::tearDown();
    unset($this->calculator);
  }

}
