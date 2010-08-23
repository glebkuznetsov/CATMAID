<?php

/**
 * tools.inc.php
 *
 * @author Stephan Saalfeld <saalfeld@mpi-cbg.de>
 * @copyright Copyright (c) 2007, Stephan Saalfeld
 * @version 0.1 TrakEM2
 *
 */
/**
 */

/**
 * create a x,y,z assoziative float array from a trakem2-postgres double3d(x,y,z)
 *
 * @return array
 */
function double3dXYZ( $double3d )
{
	$double3d = str_replace( '(', '', $double3d );
	$double3d = str_replace( ')', '', $double3d );
	$double3d = explode( ',', $double3d );
	
	return array(
		'x' => floatval( $double3d[ 0 ] ),
		'y' => floatval( $double3d[ 1 ] ),
		'z' => floatval( $double3d[ 2 ] ) );
}

/**
 * create a x,y,z assoziative integer array from a trakem2-postgres integer3d(x,y,z)
 * 
 * @return array
 */
function integer3dXYZ( $integer3d )
{
	$integer3d = str_replace( '(', '', $integer3d );
	$integer3d = str_replace( ')', '', $integer3d );
	$integer3d = explode( ',', $integer3d );
	
	return array(
		'x' => intval( $integer3d[ 0 ] ),
		'y' => intval( $integer3d[ 1 ] ),
		'z' => intval( $integer3d[ 2 ] ) );
}

/** 
 * Get all files of a given directory .
 * 
 * @return array 
 */
function getFileList( $path )
{
    $dir = opendir( $path );
    $entry = readdir( $dir);
    $list = array();
    while ( $entry != '' )
    {
        if ( $entry != '.' && $entry != '..' )
            if ( is_file( $path.'/'.$entry ) ) $list[] = $entry;
        $entry = readdir( $dir );
    }
    closedir( $dir );
    sort( $list );
    return $list;
}
