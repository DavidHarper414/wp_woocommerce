<?php
/**
 * Class for time interval handling for reports
 *
 * @package  WooCommerce/Classes
 * @version  3.5.0
 * @since    3.5.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Date & time interval handling class for Reporting API.
 */
class WC_Reports_Interval {

	/**
	 * Format string for ISO DateTime formatter.
	 *
	 * @var string
	 */
	public static $iso_datetime_format = 'Y-m-d\TH:i:s\Z';

	/**
	 * Format string for use in SQL queries.
	 *
	 * @var string
	 */
	public static $sql_datetime_format = 'Y-m-d H:i:s';

	/**
	 * Returns date format to be used as grouping clause in SQL.
	 *
	 * @param string $time_interval Time interval.
	 * @return mixed
	 */
	public static function mysql_datetime_format( $time_interval ) {
		$first_day_of_week = absint( get_option( 'start_of_week' ) );

		if ( 1 === $first_day_of_week ) {
			// Week begins on Monday, ISO 8601.
			$week_format = "DATE_FORMAT(date_created, '%x-%v')";
		} else {
			// Week begins on day other than specified by ISO 8601, needs to be in sync with function simple_week_number.
			$week_format = "CONCAT(YEAR(date_created), '-', LPAD( FLOOR( ( DAYOFYEAR(date_created) + ( ( DATE_FORMAT(MAKEDATE(YEAR(date_created),1), '%w') - $first_day_of_week + 7 ) % 7 ) - 1 ) / 7  ) + 1 , 2, '0'))";

		}

		$mysql_date_format_mapping = array(
			'hour'    => "DATE_FORMAT(date_created, '%Y-%m-%d %k')",
			'day'     => "DATE_FORMAT(date_created, '%Y-%m-%d')",
			'week'    => $week_format,
			'month'   => "DATE_FORMAT(date_created, '%Y-%m')",
			'quarter' => "CONCAT(YEAR(date_created), '-', QUARTER(date_created))",
			'year'    => 'YEAR(date_created)',

		);

		return $mysql_date_format_mapping[ $time_interval ];
	}

	/**
	 * Returns quarter for the DateTime.
	 *
	 * @param DateTime $datetime Date & time.
	 * @return int|null
	 */
	public static function quarter( $datetime ) {
		// TODO: is there a smarter way? Is floor((m - 1)/3) + 1 better?
		switch ( (int) $datetime->format( 'm' ) ) {
			case 1:
			case 2:
			case 3:
				return 1;
			case 4:
			case 5:
			case 6:
				return 2;
			case 7:
			case 8:
			case 9:
				return 3;
			case 10:
			case 11:
			case 12:
				return 4;

		}
		return null;
	}

	/**
	 * Returns simple week number for the DateTime, if week starts on $first_day_of_week.
	 *
	 * The first week of the year is considered to be the week containing January 1.
	 * The second week starts on next $first_day_of_week.
	 *
	 * @param DateTime $datetime          Date for which the week number is to be calculated.
	 * @param int      $first_day_of_week 0 for Sunday to 6 for Saturday.
	 * @return int
	 */
	public static function simple_week_number( $datetime, $first_day_of_week ) {
		$beg_of_year_day          = new DateTime( "{$datetime->format('Y')}-01-01" );
		$adj_day_beg_of_year      = ( (int) $beg_of_year_day->format( 'w' ) - $first_day_of_week + 7 ) % 7;
		$days_since_start_of_year = (int) $datetime->format( 'z' ) + 1;

		return (int) floor( ( ( $days_since_start_of_year + $adj_day_beg_of_year - 1 ) / 7 ) ) + 1;
	}

	/**
	 * Returns ISO 8601 week number for the DateTime, if week starts on Monday,
	 * otherwise returns simple week number.
	 *
	 * @see WC_Reports_Interval::simple_week_number()
	 *
	 * @param DateTime $datetime          Date for which the week number is to be calculated.
	 * @param int      $first_day_of_week 0 for Sunday to 6 for Saturday.
	 * @return int
	 */
	public static function week_number( $datetime, $first_day_of_week ) {
		if ( 1 === $first_day_of_week ) {
			$week_number = (int) $datetime->format( 'W' );
		} else {
			$week_number = WC_Reports_Interval::simple_week_number( $datetime, $first_day_of_week );
		}
		return $week_number;
	}

	/**
	 * Returns time interval id for the DateTime.
	 *
	 * @param string   $time_interval Time interval type (week, day, etc).
	 * @param DateTime $datetime      Date & time.
	 * @return string
	 */
	public static function time_interval_id( $time_interval, $datetime ) {
		$php_time_format_for = array(
			'hour'    => 'Y-m-d H',
			'day'     => 'Y-m-d',
			'week'    => 'o-W',
			'month'   => 'Y-m',
			'quarter' => 'Y-' . WC_Reports_Interval::quarter( $datetime ),
			'year'    => 'Y',
		);

		// If the week does not begin on Monday.
		$first_day_of_week = absint( get_option( 'start_of_week' ) );

		if ( 'week' === $time_interval && 1 !== $first_day_of_week ) {
			$week_no = WC_Reports_Interval::simple_week_number( $datetime, $first_day_of_week );
			$week_no = str_pad( $week_no, 2, '0', STR_PAD_LEFT );
			$year_no = $datetime->format( 'Y' );
			return "$year_no-$week_no";
		}

		return $datetime->format( $php_time_format_for[ $time_interval ] );
	}

	/**
	 * Returns a new DateTime object representing the next hour start.
	 *
	 * @param DateTime $datetime Date and time.
	 * @param bool     $reversed Going backwards in time instead of forward.
	 * @return DateTime
	 */
	public static function next_hour_start( $datetime, $reversed = false ) {
		$hour_increment         = $reversed ? 0 : 1;
		$timestamp              = (int) $datetime->format( 'U' );
		$hours_offset_timestamp = ( floor( $timestamp / HOUR_IN_SECONDS ) + $hour_increment ) * HOUR_IN_SECONDS;

		if ( $reversed ) {
			$hours_offset_timestamp --;
		}

		$hours_offset_time = new DateTime();
		$hours_offset_time->setTimestamp( $hours_offset_timestamp );
		return $hours_offset_time;
	}

	/**
	 * Returns a new DateTime object representing the next day start.
	 *
	 * @param DateTime $datetime Date and time.
	 * @param bool     $reversed Going backwards in time instead of forward.
	 * @return DateTime
	 */
	public static function next_day_start( $datetime, $reversed = false ) {
		$day_increment      = $reversed ? -1 : 1;
		$timestamp          = (int) $datetime->format( 'U' );
		$next_day_timestamp = ( floor( $timestamp / DAY_IN_SECONDS ) + $day_increment ) * DAY_IN_SECONDS;
		$next_day           = new DateTime();
		$next_day->setTimestamp( $next_day_timestamp );

		// The day boundary is actually next midnight when going in reverse, so set it to day -1 at 23:59:59.
		if ( $reversed ) {
			$timestamp            = (int) $next_day->format( 'U' );
			$end_of_day_timestamp = floor( $timestamp / DAY_IN_SECONDS ) * DAY_IN_SECONDS + DAY_IN_SECONDS - 1;
			$next_day->setTimestamp( $end_of_day_timestamp );
		}

		return $next_day;
	}

	/**
	 * Returns DateTime object representing the next week start.
	 *
	 * @param DateTime $datetime Date and time.
	 * @param bool     $reversed Going backwards in time instead of forward.
	 * @return DateTime
	 */
	public static function next_week_start( $datetime, $reversed = false ) {
		$first_day_of_week = absint( get_option( 'start_of_week' ) );
		$initial_week_no   = WC_Reports_Interval::week_number( $datetime, $first_day_of_week );

		do {
			$datetime        = WC_Reports_Interval::next_day_start( $datetime, $reversed );
			$current_week_no = WC_Reports_Interval::week_number( $datetime, $first_day_of_week );
		} while ( $current_week_no === $initial_week_no );

		// The week boundary is actually next midnight when going in reverse, so set it to day -1 at 23:59:59.
		if ( $reversed ) {
			$timestamp            = (int) $datetime->format( 'U' );
			$end_of_day_timestamp = floor( $timestamp / DAY_IN_SECONDS ) * DAY_IN_SECONDS + DAY_IN_SECONDS - 1;
			$datetime->setTimestamp( $end_of_day_timestamp );
		}

		return $datetime;
	}

	/**
	 * Returns a new DateTime object representing the next month start.
	 *
	 * @param DateTime $datetime Date and time.
	 * @param bool     $reversed Going backwards in time instead of forward.
	 * @return DateTime
	 */
	public static function next_month_start( $datetime, $reversed = false ) {
		$month_increment = 1;
		$year            = $datetime->format( 'Y' );
		$month           = (int) $datetime->format( 'm' );

		if ( $reversed ) {
			$beg_of_month_datetime       = new DateTime( "$year-$month-01 00:00:00" );
			$timestamp                   = (int) $beg_of_month_datetime->format( 'U' );
			$end_of_prev_month_timestamp = $timestamp - 1;
			$datetime->setTimestamp( $end_of_prev_month_timestamp );
		} else {
			$month += $month_increment;
			if ( $month > 12 ) {
				$month = 1;
				$year ++;
			}
			$day      = '01';
			$datetime = new DateTime( "$year-$month-$day 00:00:00" );
		}

		return $datetime;
	}

	/**
	 * Returns a new DateTime object representing the next quarter start.
	 *
	 * @param DateTime $datetime Date and time.
	 * @param bool     $reversed Going backwards in time instead of forward.
	 * @return DateTime
	 */
	public static function next_quarter_start( $datetime, $reversed = false ) {
		$month_increment = 3;
		$year            = $datetime->format( 'Y' );
		$month           = (int) $datetime->format( 'm' );

		if ( $reversed ) {
			$month += -1 * $month_increment;
			if ( $month < 1 ) {
				$month = $month + 12;
				$year --;
			}
			$beg_of_month_datetime       = new DateTime( "$year-$month-01 00:00:00" );
			$timestamp                   = (int) $beg_of_month_datetime->format( 'U' );
			$end_of_prev_month_timestamp = $timestamp - 1;
			$datetime->setTimestamp( $end_of_prev_month_timestamp );
		} else {
			$month += $month_increment;
			if ( $month > 12 ) {
				$month = 1;
				$year ++;
			}
			$day      = '01';
			$datetime = new DateTime( "$year-$month-$day 00:00:00" );
		}

		return $datetime;
	}

	/**
	 * Return a new DateTime object representing the next year start.
	 *
	 * @param DateTime $datetime Date and time.
	 * @param bool     $reversed Going backwards in time instead of forward.
	 * @return DateTime
	 */
	public static function next_year_start( $datetime, $reversed = false ) {
		$year_increment = 1;
		$year           = (int) $datetime->format( 'Y' );
		$month          = '01';
		$day            = '01';

		if ( $reversed ) {
			$datetime                   = new DateTime( "$year-$month-$day 00:00:00" );
			$timestamp                  = (int) $datetime->format( 'U' );
			$end_of_prev_year_timestamp = $timestamp - 1;
			$datetime->setTimestamp( $end_of_prev_year_timestamp );
		} else {
			$year    += $year_increment;
			$datetime = new DateTime( "$year-$month-$day 00:00:00" );
		}

		return $datetime;
	}

	/**
	 * Returns beginning of next time interval for provided DateTime.
	 *
	 * E.g. for current DateTime, beginning of next day, week, quarter, etc.
	 *
	 * @param DateTime $datetime      Date and time.
	 * @param string   $time_interval Time interval, e.g. week, day, hour.
	 * @param bool     $reversed Going backwards in time instead of forward.
	 * @return DateTime
	 */
	public static function iterate( $datetime, $time_interval, $reversed = false ) {
		return call_user_func( array( __CLASS__, "next_{$time_interval}_start" ), $datetime, $reversed );
	}

}
